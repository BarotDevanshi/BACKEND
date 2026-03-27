import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import TaskCard from '../components/TaskCard';
import SleepCard from '../components/SleepCard';
import RecommendationCard from '../components/RecommendationCard';
import { BiBrain } from 'react-icons/bi';
import { FiSmile, FiCheckSquare, FiMoon } from 'react-icons/fi';
import { getMoods, getTasks, getSleep, logAppOpen } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const userName = localStorage.getItem('nn-displayName') || user?.name || 'Demo';
  const [stats, setStats] = useState({ mood: '...', tasks: '...', sleep: '...' });

  useEffect(() => {
    async function loadStats() {
      try {
        const [mReq, tReq, sReq] = await Promise.all([getMoods(), getTasks(), getSleep()]);
        
        const latestMood = mReq.data.data?.[0]?.mood || 'None';
        const pendingTasks = (tReq.data.data || []).filter(t => !t.completed).length;
        
        let sleepStr = 'No data';
        const sleeps = sReq.data.data || [];
        if (sleeps.length > 0) {
           const latest = sleeps[0];
           if (latest.sleepTime && latest.wakeTime) {
             const st = new Date(latest.sleepTime);
             const wt = new Date(latest.wakeTime);
             let diff = (wt - st) / (1000 * 60);
             if (diff < 0) diff += 24 * 60;
             const h = Math.floor(diff / 60);
             sleepStr = `${h}h logged`;
           }
        }

        setStats({ 
          mood: latestMood.charAt(0).toUpperCase() + latestMood.slice(1), 
          tasks: `${pendingTasks} left`, 
          sleep: sleepStr 
        });
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    }
    loadStats();
    // Log daily app open for streak (no-op if already called today)
    logAppOpen().catch(() => {});
  }, []);

  const quickNav = [
    { id: 'mood-card', label: 'Mood', icon: <FiSmile size={20}/>, color: '#179044', val: stats.mood },
    { id: 'task-card', label: 'Tasks', icon: <FiCheckSquare size={20}/>, color: '#179044', val: stats.tasks },
    { id: 'sleep-card', label: 'Sleep', icon: <FiMoon size={20}/>, color: '#179044', val: stats.sleep },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Exact match for the Hello header */}
      <div className="gradient-header">
        <h1>
          <BiBrain />
          Hello, {userName}!
        </h1>
        <p>Let's make today great 🤍</p>
      </div>

      {/* Quick Navigation / Overview Cards (Glassmorphism) */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {quickNav.map(n => (
            <div 
              key={n.id} 
              onClick={() => scrollTo(n.id)}
              style={{ 
                background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '20px', padding: '16px 12px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: `${n.color}20`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                {n.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{n.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="mood-card"><MoodCard /></div>
      <div id="task-card"><TaskCard /></div>
      <div id="sleep-card"><SleepCard /></div>
      <div id="rec-card"><RecommendationCard /></div>
    </div>
  );
}
