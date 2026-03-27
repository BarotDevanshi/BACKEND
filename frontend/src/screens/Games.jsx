import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { IoGameControllerOutline } from 'react-icons/io5';
// No reward modal anymore; games are just for relaxation.

// ─── 1. BREATHING EXERCISE ─────────────────────────────────────────────────
function BreathingGame({ onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | inhale | hold | exhale
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const totalCycles = 5;

  const PHASES = [
    { name: 'inhale', label: 'Breathe In 🌬️', duration: 4, color: '#4ADE80', scale: 1.4 },
    { name: 'hold', label: 'Hold...', duration: 4, color: '#FBBF24', scale: 1.4 },
    { name: 'exhale', label: 'Breathe Out 💨', duration: 4, color: '#818CF8', scale: 1.0 },
  ];

  const [phaseIdx, setPhaseIdx] = useState(0);
  const currentPhase = PHASES[phaseIdx];

  const startBreathing = () => {
    setPhase('inhale');
    setPhaseIdx(0);
    setCycle(0);
    setCountdown(4);
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    clearInterval(timerRef.current);
    setCountdown(PHASES[phaseIdx].duration);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Advance phase
          setPhaseIdx(pi => {
            const next = (pi + 1) % 3;
            if (next === 0) {
              // completed one full cycle
              setCycle(c => {
                const newCycle = c + 1;
                if (newCycle >= totalCycles) {
                  setPhase('done');
                  onComplete();
                  return newCycle;
                }
                return newCycle;
              });
            }
            return next;
          });
          return PHASES[(phaseIdx + 1) % 3].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, phaseIdx]);

  const circleScale = phase === 'idle' ? 1 : currentPhase.scale;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Breathing Exercise 🧘</h3>
      <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '24px' }}>5 cycles · Inhale → Hold → Exhale</p>

      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        {/* Outer ring */}
        <div style={{
          width: '160px', height: '160px', borderRadius: '50%',
          border: `4px solid ${phase === 'idle' ? '#E5E7EB' : currentPhase.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.5s ease'
        }}>
          {/* Inner breathing circle */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: phase === 'idle' ? 'linear-gradient(135deg, #058b5e 0%, #119166 60%, #0dcf8e 100%)' : currentPhase.color,
            transform: `scale(${circleScale})`,
            transition: `transform ${currentPhase?.duration || 1}s ease-in-out, background 0.5s`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.5rem'
          }}>
            {phase === 'idle' ? '🌿' : countdown}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', minHeight: '28px' }}>
        {phase === 'idle' && <p style={{ color: '#9CA3AF' }}>Press Start to begin</p>}
        {phase !== 'idle' && phase !== 'done' && (
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: currentPhase.color }}>{currentPhase.label}</p>
        )}
        {phase === 'done' && <p style={{ fontWeight: 700, color: '#4ADE80', fontSize: '1.1rem' }}>Well done! 🎉</p>}
      </div>

      {phase !== 'idle' && phase !== 'done' && (
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '20px' }}>Cycle {cycle + 1} of {totalCycles}</p>
      )}

      {phase === 'idle' && (
        <button onClick={startBreathing} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #058b5e 0%, #119166 60%, #0dcf8e 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          Start Breathing 🌬️
        </button>
      )}
    </div>
  );
}

// ─── 2. MEMORY MATCH ───────────────────────────────────────────────────────
const EMOJIS = ['🧠','💙','🌿','⚡','🎯','🌙','🔥','✨'];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function MemoryMatch({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const initGame = () => {
    const deck = shuffle([...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, matched: false })));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    setStarted(true);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = [...matched, cards[a].emoji];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === EMOJIS.length) {
          clearInterval(timerRef.current);
          onComplete();
        }
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }, [flipped]);

  const handleFlip = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(cards[idx].emoji)) return;
    setFlipped(prev => [...prev, idx]);
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Memory Match 🎯</h3>
        <button onClick={initGame} style={{ background: 'var(--primary-light,#F3E8FF)', color: '#119166', borderRadius: '8px', padding: '6px 14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {started ? '↻ Reset' : 'Start'}
        </button>
      </div>

      {!started ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🃏</div>
          <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>Match all 8 emoji pairs!</p>
          <button onClick={initGame} style={{ padding: '12px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #058b5e 0%, #119166 60%, #0dcf8e 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            Start Game 🎮
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', justifyContent: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Moves: <strong style={{ color: '#1F2937' }}>{moves}</strong></span>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Time: <strong style={{ color: '#1F2937' }}>{elapsed}s</strong></span>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Matched: <strong style={{ color: '#10B981' }}>{matched.length}/{EMOJIS.length}</strong></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {cards.map((card, idx) => {
              const isFlipped = flipped.includes(idx) || matched.includes(card.emoji);
              return (
                <div key={card.id} onClick={() => handleFlip(idx)} style={{
                  height: '60px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem',
                  background: matched.includes(card.emoji)
                    ? 'linear-gradient(135deg,#4ADE80,#22C55E)'
                    : isFlipped ? 'linear-gradient(135deg,#B246D2,#F037A5)'
                    : 'linear-gradient(135deg,#E5E7EB,#D1D5DB)',
                  color: isFlipped ? 'white' : 'transparent',
                  transform: isFlipped ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.25s ease',
                  boxShadow: isFlipped ? '0 4px 12px rgba(178,70,210,0.3)' : 'none',
                  userSelect: 'none'
                }}>
                  {isFlipped ? card.emoji : '?'}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 3. STRESS POP ─────────────────────────────────────────────────────────
function StressPop({ onComplete }) {
  const ROWS = 5, COLS = 5;
  const total = ROWS * COLS;
  const [popped, setPopped] = useState(new Set());
  const [started, setStarted] = useState(false);

  const startGame = () => { setPopped(new Set()); setStarted(true); };

  const popBubble = (idx) => {
    if (popped.has(idx)) return;
    const newPopped = new Set(popped);
    newPopped.add(idx);
    setPopped(newPopped);
    if (newPopped.size === total) {
      setTimeout(() => onComplete(), 400);
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Stress Pop 💥</h3>
      <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '20px' }}>Pop all the bubbles to release stress!</p>

      {!started ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🫧</div>
          <button onClick={startGame} style={{ padding: '12px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #058b5e 0%, #119166 60%, #0dcf8e 100%)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            Pop 'Em All! 💥
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Popped: <strong style={{ color: '#10B981' }}>{popped.size}/{total}</strong></span>
            <button onClick={startGame} style={{ background: 'var(--primary-light,#F3E8FF)', color: '#A855F7', borderRadius: '8px', padding: '4px 12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>↻ Reset</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '10px' }}>
            {Array.from({ length: total }, (_, idx) => (
              <div key={idx} onClick={() => popBubble(idx)} style={{
                height: '52px', borderRadius: '50%', cursor: popped.has(idx) ? 'default' : 'pointer',
                background: popped.has(idx)
                  ? 'radial-gradient(circle, #E5E7EB, #D1D5DB)'
                  : 'radial-gradient(circle at 35% 35%, #C084FC, #7C3AED)',
                boxShadow: popped.has(idx) ? 'none' : '0 4px 12px rgba(124,58,237,0.4), inset 0 -3px 6px rgba(0,0,0,0.2)',
                transform: popped.has(idx) ? 'scale(0.85)' : 'scale(1)',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {popped.has(idx) ? '💨' : ''}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN GAMES SCREEN ─────────────────────────────────────────────────────
export default function Games() {
  const [activeGame, setActiveGame] = useState(null);

  const handleGameComplete = (gameName) => {
    toast.success(`${gameName} complete! Great job taking a moment for yourself. 🌿`, {
      icon: '✨'
    });
    setActiveGame(null);
  };

  const GAME_LIST = [
    { id: 'breathing', title: 'Breathing Exercise', sub: 'Calm your mind with guided breathing', icon: '🌬️', color: '#60A5FA' },
    { id: 'pop', title: 'Tap to Relax', sub: 'Simple tapping for instant calm', icon: '🫧', color: '#F472B6' },
    { id: 'memory', title: 'Focus Game', sub: 'Train your attention gently', icon: '⚡', color: '#6EE7B7' }
  ];

  if (activeGame) {
    return (
      <div style={{ paddingBottom: '80px', padding: '16px' }}>
        <button 
          onClick={() => setActiveGame(null)} 
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Games
        </button>
        {activeGame === 'breathing' && <BreathingGame onComplete={() => handleGameComplete('Breathing Exercise')} />}
        {activeGame === 'pop' && <StressPop onComplete={() => handleGameComplete('Tap to Relax')} />}
        {activeGame === 'memory' && <MemoryMatch onComplete={() => handleGameComplete('Focus Game')} />}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="gradient-header">
        <h1><IoGameControllerOutline /> Mind Games</h1>
        <p>Relax, focus &amp; recharge 🧠</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {GAME_LIST.map(game => (
          <div 
            key={game.id} 
            className="card"
            onClick={() => setActiveGame(game.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
              cursor: 'pointer', transition: 'transform 0.2s', margin: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Icon Block */}
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '16px', 
              background: game.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', color: 'white', flexShrink: 0, opacity: 0.95
            }}>
              {game.icon}
            </div>
            
            {/* Text Block */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{game.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{game.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
