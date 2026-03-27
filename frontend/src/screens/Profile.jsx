import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMoods, getProgress } from '../services/api';
import { FiLogOut, FiSun, FiMoon, FiEdit2, FiUser, FiBell, FiLock, FiChevronRight } from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { toast } from 'react-toastify';

// ─── DARK MODE ────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('nn-theme') === 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('nn-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark];
}

// ─── AVATAR CONFIG ────────────────────────────────────────────────────────
const SKIN_TONES   = ['#FDDBB4','#F2C28A','#D4956A','#A0614A','#6B3A2A'];
const HAIR_COLORS  = ['#1A0A00','#4A2200','#8B5E3C','#E8B86D','#C0392B','#7B2D8B','#7F8C8D'];
const OUTFIT_COLS  = ['#E91E8C','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'];
const GIRL_STYLES  = ['straight','layered','bun','ponytail'];
const BOY_STYLES   = ['undercut','textured','wavy','buzz'];

const MOOD_FACE = {
  happy:   { brow:'M32,34 Q40,28 48,34  M52,34 Q60,28 68,34', eye:'M36,44 Q40,38 44,44  M56,44 Q60,38 64,44', mouth:'M36,60 Q50,73 64,60', blush:true },
  neutral: { brow:'M33,34 L47,34  M53,34 L67,34',             eye:'M36,44 L44,44  M56,44 L64,44',             mouth:'M38,62 L62,62', blush:false },
  sad:     { brow:'M33,32 Q40,38 47,32  M53,32 Q60,38 67,32', eye:'M36,46 Q40,40 44,46  M56,46 Q60,40 64,46', mouth:'M38,65 Q50,57 62,65', blush:false },
  stressed:{ brow:'M34,28 Q40,36 46,30  M54,30 Q60,36 66,28', eye:'M36,46 Q40,40 44,46  M56,46 Q60,40 64,46', mouth:'M40,64 Q50,57 60,64', blush:false },
  angry:   { brow:'M32,34 Q40,40 48,32  M52,32 Q60,40 68,34', eye:'M36,46 Q40,42 44,46  M56,46 Q60,42 64,46', mouth:'M40,64 Q50,57 60,64', blush:false },
};

// ─── MATURE AVATAR SVG ───────────────────────────────────────────────────
function MatureAvatar({ gender, skin, hair, hairStyle, outfit, mood }) {
  const face = MOOD_FACE[mood] || MOOD_FACE.neutral;
  const isGirl = gender === 'girl';

  const renderHair = () => {
    const c = hair;
    if (isGirl) {
      if (hairStyle === 'bun') return <>
        <ellipse cx="50" cy="26" rx="24" ry="22" fill={c}/>
        <circle cx="50" cy="8" r="10" fill={c}/>
        <ellipse cx="28" cy="46" rx="6" ry="18" fill={c}/>
        <ellipse cx="72" cy="46" rx="6" ry="18" fill={c}/>
      </>;
      if (hairStyle === 'layered') return <>
        <ellipse cx="50" cy="26" rx="24" ry="22" fill={c}/>
        <path d="M26,30 Q20,60 26,80 Q32,72 30,55 Z" fill={c}/>
        <path d="M74,30 Q80,60 74,80 Q68,72 70,55 Z" fill={c}/>
        <path d="M26,50 Q24,70 30,82 Q36,76 34,62 Z" fill={c}/>
        <path d="M74,50 Q76,70 70,82 Q64,76 66,62 Z" fill={c}/>
      </>;
      if (hairStyle === 'ponytail') return <>
        <ellipse cx="50" cy="26" rx="24" ry="22" fill={c}/>
        <ellipse cx="28" cy="44" rx="6" ry="14" fill={c}/>
        <path d="M70,26 Q88,22 84,50 Q80,42 76,46" fill={c}/>
      </>;
      // straight
      return <>
        <ellipse cx="50" cy="26" rx="24" ry="22" fill={c}/>
        <rect x="27" y="30" width="9" height="50" rx="4" fill={c}/>
        <rect x="64" y="30" width="9" height="50" rx="4" fill={c}/>
      </>;
    } else {
      if (hairStyle === 'buzz') return <ellipse cx="50" cy="22" rx="24" ry="10" fill={c}/>;
      if (hairStyle === 'wavy') return <>
        <ellipse cx="50" cy="22" rx="24" ry="14" fill={c}/>
        <path d="M26,26 Q30,18 36,24 Q40,16 46,22 Q50,14 54,22 Q60,16 66,24 Q72,18 76,26" fill={c} opacity="0.85"/>
      </>;
      if (hairStyle === 'textured') return <>
        <ellipse cx="50" cy="22" rx="24" ry="14" fill={c}/>
        <path d="M28,22 Q32,14 40,20 Q44,10 50,18 Q56,10 60,20 Q68,14 72,22" fill={c}/>
      </>;
      // undercut
      return <>
        <ellipse cx="50" cy="20" rx="24" ry="14" fill={c}/>
        <rect x="26" y="24" width="48" height="10" fill={c}/>
      </>;
    }
  };

  return (
    <svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))' }}>
      {/* Hair back layer */}
      {renderHair()}

      {/* Neck */}
      <rect x="43" y="78" width="14" height="16" rx="4" fill={skin}/>

      {/* Head */}
      <ellipse cx="50" cy="46" rx="22" ry="26" fill={skin}/>

      {/* Ears */}
      <ellipse cx="28" cy="48" rx="5" ry="7" fill={skin}/>
      <ellipse cx="72" cy="48" rx="5" ry="7" fill={skin}/>
      <ellipse cx="28" cy="48" rx="3" ry="5" fill={skin} opacity="0.6"/>
      <ellipse cx="72" cy="48" rx="3" ry="5" fill={skin} opacity="0.6"/>

      {/* Eyebrows */}
      <path d={face.brow} stroke={hair === '#7F8C8D' ? '#555' : hair} strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* Eye whites */}
      <ellipse cx="40" cy="45" rx="6" ry="5" fill="white"/>
      <ellipse cx="60" cy="45" rx="6" ry="5" fill="white"/>

      {/* Irises */}
      <circle cx="40" cy="46" r="3.5" fill="#3D2B1F"/>
      <circle cx="60" cy="46" r="3.5" fill="#3D2B1F"/>
      <circle cx="41" cy="44.5" r="1.2" fill="white"/>
      <circle cx="61" cy="44.5" r="1.2" fill="white"/>

      {/* Stylised eye lines */}
      <path d={face.eye} stroke="#1A0A00" strokeWidth="1.6" fill="none" strokeLinecap="round"/>

      {/* Nose — subtle */}
      <path d="M48,56 Q50,60 52,56" stroke="#C49A6C" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <circle cx="48" cy="57" r="0.8" fill="#C49A6C"/>
      <circle cx="52" cy="57" r="0.8" fill="#C49A6C"/>

      {/* Lips */}
      {isGirl ? (
        <>
          <path d={face.mouth} stroke="#E91E8C" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M40,62 Q50,66 60,62" fill="rgba(233,30,140,0.18)"/>
        </>
      ) : (
        <path d={face.mouth} stroke="#9B5544" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}

      {/* Blush */}
      {face.blush && <>
        <ellipse cx="33" cy="56" rx="7" ry="4" fill="#F8A4C0" opacity="0.38"/>
        <ellipse cx="67" cy="56" rx="7" ry="4" fill="#F8A4C0" opacity="0.38"/>
      </>}

      {/* Girl earrings */}
      {isGirl && <>
        <circle cx="27" cy="56" r="2.5" fill="#FFD700"/>
        <circle cx="73" cy="56" r="2.5" fill="#FFD700"/>
      </>}

      {/* Body ── Girl */}
      {isGirl ? (
        <>
          {/* Elegant top / fitted dress */}
          <path d="M30,92 Q24,96 22,118 L78,118 Q76,96 70,92 Q62,88 50,88 Q38,88 30,92 Z" fill={outfit}/>
          {/* Neckline detail */}
          <path d="M40,92 Q50,98 60,92" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
          {/* Dress skirt */}
          <path d="M22,116 Q16,130 18,150 L82,150 Q84,130 78,116 Z" fill={outfit} opacity="0.85"/>
          {/* Leg gap */}
          <rect x="34" y="148" width="14" height="26" rx="6" fill={skin}/>
          <rect x="52" y="148" width="14" height="26" rx="6" fill={skin}/>
          {/* Heels */}
          <ellipse cx="41" cy="176" rx="11" ry="4.5" fill="#2D1B69"/>
          <ellipse cx="59" cy="176" rx="11" ry="4.5" fill="#2D1B69"/>
          <rect x="44" y="172" width="3" height="6" rx="1" fill="#2D1B69"/>
          <rect x="56" y="172" width="3" height="6" rx="1" fill="#2D1B69"/>
        </>
      ) : (
        <>
          {/* Smart fitted shirt */}
          <path d="M28,92 Q22,96 20,118 L80,118 Q78,96 72,92 Q62,88 50,88 Q38,88 28,92 Z" fill={outfit}/>
          {/* Collar */}
          <path d="M40,92 L50,100 L60,92" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
          {/* Arms */}
          <rect x="13" y="92" width="11" height="30" rx="5" fill={outfit}/>
          <rect x="76" y="92" width="11" height="30" rx="5" fill={outfit}/>
          {/* Hands */}
          <circle cx="18" cy="123" r="6" fill={skin}/>
          <circle cx="82" cy="123" r="6" fill={skin}/>
          {/* Trousers */}
          <path d="M20,116 Q18,124 20,150 L48,150 L50,126 L52,150 L80,150 Q82,124 80,116 Z" fill="#1E293B"/>
          {/* Legs */}
          <rect x="31" y="148" width="16" height="22" rx="7" fill="#0F172A"/>
          <rect x="53" y="148" width="16" height="22" rx="7" fill="#0F172A"/>
          {/* Sneakers */}
          <ellipse cx="39" cy="172" rx="14" ry="6" fill="#B246D2"/>
          <ellipse cx="61" cy="172" rx="14" ry="6" fill="#B246D2"/>
          <rect x="26" y="168" width="26" height="4" rx="2" fill="white" opacity="0.3"/>
          <rect x="48" y="168" width="26" height="4" rx="2" fill="white" opacity="0.3"/>
        </>
      )}
    </svg>
  );
}

// ─── NEURAL AVATAR DOTS ───────────────────────────────────────────────
const NODES = [
  {x:8,y:20},{x:25,y:55},{x:15,y:80},{x:42,y:12},{x:55,y:38},
  {x:72,y:15},{x:88,y:45},{x:80,y:75},{x:60,y:68},{x:35,y:70},
];
const LINKS = [[0,3],[3,5],[5,1],[1,4],[4,6],[6,7],[7,8],[8,9],[9,2],[2,0],[3,4],[4,5],[8,4],[1,9]];

// ─── SIMPLE BANNER ───────────────────────────────────────────────
function SimpleBanner({ dark, onDark }) {
  return (
    <div className="gradient-header" style={{ position: 'relative' }}>
      <button onClick={onDark} style={{
        position: 'absolute', top: '24px', right: '24px',
        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', 
        border: 'none', borderRadius: '50%', width: '38px', height: '38px', 
        cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {dark ? <FiSun size={18}/> : <FiMoon size={18}/>}
      </button>

      <h1><FiUser /> Profile</h1>
      <p>Manage your account</p>
    </div>
  );
}

// ─── MAIN PROFILE SCREEN ─────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();
  const [latestMood, setLatestMood] = useState('neutral');
  const [progress, setProgress]     = useState(null);
  const [tab, setTab]               = useState('avatar');

  const [gender,    setGender]    = useState(() => localStorage.getItem('nn-gender')    || 'girl');
  const [skin,      setSkin]      = useState(() => localStorage.getItem('nn-skin')      || SKIN_TONES[0]);
  const [hair,      setHair]      = useState(() => localStorage.getItem('nn-hair')      || HAIR_COLORS[0]);
  const [hairStyle, setHairStyle] = useState(() => localStorage.getItem('nn-hairStyle') || 'straight');
  const [outfit,    setOutfit]    = useState(() => localStorage.getItem('nn-outfit')    || OUTFIT_COLS[0]);
  const [avatarBg,  setAvatarBg]  = useState(() => localStorage.getItem('nn-avatarBg')  || 'linear-gradient(145deg,#6B21A8,#9333EA,#EC4899)');

  const [displayName, setDisplayName] = useState(() => localStorage.getItem('nn-displayName') || user?.name || '');
  const [notif, setNotif] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [mr, pr] = await Promise.all([getMoods(), getProgress()]);
      const moods = mr.data.data || [];
      if (moods.length > 0) setLatestMood(moods[0].mood || 'neutral');
      setProgress(pr.data.data || null);
    } catch {}
  };

  const save = (key, val, setter) => { setter(val); localStorage.setItem(key, val); };
  const saveSettings = () => { localStorage.setItem('nn-displayName', displayName); toast.success('Profile saved! ✨'); };

  const STYLES = gender === 'girl' ? GIRL_STYLES : BOY_STYLES;

  return (
    <div style={{ paddingBottom: '90px', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Banner ── */}
      <SimpleBanner
        dark={dark}
        onDark={() => setDark(!dark)}
      />

      {/* ── Tab Switcher ── */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', margin: '20px 18px 0', borderRadius: '16px', padding: '5px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid var(--border)' }}>
        {[{key:'avatar',label:'🎭 My Avatar'},{key:'settings',label:'⚙️ Settings'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.88rem',
            background: tab===t.key ? 'linear-gradient(135deg, #016443, #06c585)' : 'transparent',
            color: tab===t.key ? 'white' : 'var(--text-secondary)', transition:'all 0.3s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ─── AVATAR TAB ─── */}
      {tab === 'avatar' && (
        <div style={{ padding: '16px 18px' }}>

          {/* Gender */}
          <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
            {['girl','boy'].map(g => (
              <button key={g} onClick={() => { save('nn-gender',g,setGender); setHairStyle(g==='girl'?'straight':'undercut'); }} style={{
                flex:1, padding:'13px', borderRadius:'16px',
                border:`2px solid ${gender===g?'#06c585':'var(--border)'}`,
                background: gender===g ? 'linear-gradient(135deg,rgba(178,70,210,0.12),rgba(240,55,165,0.08))' : 'var(--bg-secondary)',
                fontWeight:700, fontSize:'1rem', cursor:'pointer',
                color: gender===g ? '#06c585' : 'var(--text-secondary)', transition:'all 0.25s'
              }}>{g==='girl'?'👩 Girl':'👦 Boy'}</button>
            ))}
          </div>

          {/* Avatar Preview */}
          <div style={{
            background: avatarBg,
            borderRadius: '28px', padding: '24px 20px 16px',
            marginBottom: '18px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(139,92,246,0.45)', minHeight: '300px'
          }}>
            {/* Neural dots BG */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.15 }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              {LINKS.map(([a,b],i) => <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="white" strokeWidth="0.5"/>)}
              {NODES.map((n,i) => <circle key={i} cx={n.x} cy={n.y} r="1.5" fill="white"/>)}
            </svg>

            {/* Avatar */}
            <div style={{ height: '240px', display:'flex', justifyContent:'center', alignItems:'flex-end', position:'relative', zIndex:2 }}>
              <MatureAvatar gender={gender} skin={skin} hair={hair} hairStyle={hairStyle} outfit={outfit} mood={latestMood} />
            </div>

            {/* Mood badge */}
            <div style={{ textAlign:'center', marginTop:'10px', position:'relative', zIndex:2 }}>
              <span style={{ background:'rgba(255,255,255,0.22)', backdropFilter:'blur(8px)', borderRadius:'20px', padding:'5px 18px', color:'white', fontWeight:700, fontSize:'0.8rem', textTransform:'capitalize', border:'1px solid rgba(255,255,255,0.3)' }}>
                Feeling {latestMood} {latestMood==='happy'?'😊':latestMood==='sad'?'😢':latestMood==='angry'?'😡':latestMood==='stressed'?'😰':'😐'}
              </span>
            </div>
          </div>

          {/* ── Customizer Cards ── */}
          {/* Skin */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'14px' }}>🎨 Skin Tone</p>
            <div style={{ display:'flex', gap:'10px' }}>
              {SKIN_TONES.map(c => (
                <div key={c} onClick={() => save('nn-skin',c,setSkin)} style={{ width:'38px', height:'38px', borderRadius:'50%', background:c, cursor:'pointer', border:`3px solid ${skin===c?'#B246D2':'transparent'}`, boxShadow: skin===c?'0 0 0 2px white,0 0 0 4px #B246D2':'none', transition:'all 0.2s' }}/>
              ))}
            </div>
          </div>

          {/* Hair color */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'14px' }}>💇 Hair Color</p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {HAIR_COLORS.map(c => (
                <div key={c} onClick={() => save('nn-hair',c,setHair)} style={{ width:'38px', height:'38px', borderRadius:'50%', background:c, cursor:'pointer', border:`3px solid ${hair===c?'#B246D2':'transparent'}`, boxShadow: hair===c?'0 0 0 2px white,0 0 0 4px #B246D2':'none', transition:'all 0.2s' }}/>
              ))}
            </div>
          </div>

          {/* Hair style */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'14px' }}>✂️ Hair Style</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {STYLES.map(hs => (
                <button key={hs} onClick={() => save('nn-hairStyle',hs,setHairStyle)} style={{
                  padding:'8px 18px', borderRadius:'20px', cursor:'pointer',
                  border:`2px solid ${hairStyle===hs?'#016443':'var(--border)'}`,
                  background: hairStyle===hs?'linear-gradient(135deg, #016443, #06c585)':'var(--bg-input)',
                  color: hairStyle===hs?'white':'var(--text-secondary)',
                  fontWeight:600, fontSize:'0.82rem', textTransform:'capitalize', transition:'all 0.2s'
                }}>{hs}</button>
              ))}
            </div>
          </div>

          {/* Outfit */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'14px' }}>👗 Outfit Color</p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {OUTFIT_COLS.map(c => (
                <div key={c} onClick={() => save('nn-outfit',c,setOutfit)} style={{ width:'38px', height:'38px', borderRadius:'10px', background:c, cursor:'pointer', border:`3px solid ${outfit===c?'#1F2937':'transparent'}`, boxShadow: outfit===c?'0 0 0 2px white,0 0 0 4px #1F2937':'none', transition:'all 0.2s' }}/>
              ))}
            </div>
          </div>

          {/* Background */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'14px' }}>🖼️ Background</p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {[
                'linear-gradient(145deg,#6B21A8,#9333EA,#EC4899)',
                'linear-gradient(145deg,#059669,#10B981,#34D399)',
                'linear-gradient(145deg,#2563EB,#3B82F6,#60A5FA)',
                'linear-gradient(145deg,#E11D48,#F43F5E,#FB7185)',
                'linear-gradient(145deg,#D97706,#F59E0B,#FCD34D)',
                'linear-gradient(145deg,#475569,#64748B,#94A3B8)'
              ].map((c, i) => (
                <div key={i} onClick={() => save('nn-avatarBg',c,setAvatarBg)} style={{ width:'38px', height:'38px', borderRadius:'10px', background:c, cursor:'pointer', border:`3px solid ${avatarBg===c?'#1F2937':'transparent'}`, boxShadow: avatarBg===c?'0 0 0 2px white,0 0 0 4px #1F2937':'none', transition:'all 0.2s' }}/>
              ))}
            </div>
          </div>

          {/* Badges */}
          {progress?.badges?.length > 0 && (
            <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)' }}>
              <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'12px' }}>🏆 Earned Badges</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {progress.badges.map((b,i) => (
                  <span key={i} style={{ background:'linear-gradient(135deg,#B246D2,#F037A5)', color:'white', borderRadius:'20px', padding:'6px 16px', fontSize:'0.78rem', fontWeight:700 }}>{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SETTINGS TAB ─── */}
      {tab === 'settings' && (
        <div style={{ padding: '16px 18px' }}>

          {/* Dark Mode */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                {dark ? <FiMoon size={20} color="#818CF8"/> : <FiSun size={20} color="#F59E0B"/>}
                <div>
                  <p style={{ fontWeight:700, color:'var(--text-primary)' }}>{dark?'Dark Mode':'Light Mode'}</p>
                  <p style={{ fontSize:'0.73rem', color:'var(--text-tertiary)' }}>Change app appearance</p>
                </div>
              </div>
              <div onClick={() => setDark(!dark)} style={{ width:'52px', height:'28px', borderRadius:'14px', cursor:'pointer', background: dark?'linear-gradient(135deg, #016443, #06c585)':'#E5E7EB', position:'relative', transition:'background 0.3s' }}>
                <div style={{ position:'absolute', top:'3px', left: dark?'26px':'3px', width:'22px', height:'22px', borderRadius:'50%', background:'white', boxShadow:'0 2px 6px rgba(0,0,0,0.2)', transition:'left 0.3s' }}></div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <FiBell size={20} color="#10B981"/>
                <div>
                  <p style={{ fontWeight:700, color:'var(--text-primary)' }}>Notifications</p>
                  <p style={{ fontSize:'0.73rem', color:'var(--text-tertiary)' }}>Reminders &amp; tips</p>
                </div>
              </div>
              <div onClick={() => setNotif(!notif)} style={{ width:'52px', height:'28px', borderRadius:'14px', cursor:'pointer', background: notif?'linear-gradient(135deg,#10B981,#059669)':'#E5E7EB', position:'relative', transition:'background 0.3s' }}>
                <div style={{ position:'absolute', top:'3px', left: notif?'26px':'3px', width:'22px', height:'22px', borderRadius:'50%', background:'white', boxShadow:'0 2px 6px rgba(0,0,0,0.2)', transition:'left 0.3s' }}></div>
              </div>
            </div>
          </div>

          {/* Other settings */}
          {[
            { icon:<FiLock size={18} color="#8B5CF6"/>, label:'Change Password', sub:'Update your account password' },
            { icon:<FiChevronRight size={18} color="#6B7280"/>, label:'Privacy', sub:'Manage data & privacy' },
          ].map(item => (
            <div key={item.label} onClick={() => toast.info('Coming soon! 🚧')} style={{ background:'var(--bg-secondary)', borderRadius:'20px', padding:'18px', marginBottom:'12px', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' }}>
              {item.icon}
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, color:'var(--text-primary)' }}>{item.label}</p>
                <p style={{ fontSize:'0.73rem', color:'var(--text-tertiary)' }}>{item.sub}</p>
              </div>
              <FiChevronRight size={16} color="var(--text-tertiary)"/>
            </div>
          ))}

          {/* Sign Out */}
          <div onClick={logout} style={{ background:'linear-gradient(135deg,#FEE2E2,#FECACA)', borderRadius:'20px', padding:'18px', border:'2px solid #FCA5A5', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
            <FiLogOut size={20} color="#EF4444"/>
            <span style={{ fontWeight:700, color:'#EF4444' }}>Sign Out</span>
          </div>
        </div>
      )}

      {/* ── NeuroNexus Branding ── */}
      <div style={{ padding: '24px', textAlign: 'center', marginTop: '10px' }}>
        <div style={{
          width: '64px', height: '64px', background: 'linear-gradient(135deg, #016443, #06c585)',
          borderRadius: '16px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(178,70,210,0.3)', color: 'white'
        }}>
          <BiBrain size={36} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>NeuroNexus</h3>
        <p style={{ color: '#06c585', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Version 1.0.0</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your ADHD-friendly productivity companion</p>
      </div>

    </div>
  );
}
