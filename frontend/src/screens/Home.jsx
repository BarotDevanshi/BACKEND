import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import TaskCard from '../components/TaskCard';
import SleepCard from '../components/SleepCard';
import { BiBrain } from 'react-icons/bi';
import { FiSmile, FiCheckSquare, FiMoon } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { getMoods, getTasks, getSleep, logAppOpen } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const userName = user?.name || localStorage.getItem('nn-displayName') || 'User';
  const navigate = useNavigate();
  const [stats, setStats] = useState({ mood: '...', tasks: '...', sleep: '...' });

  useEffect(() => {
    async function loadStats() {
      try {
        console.log("[Home] 📊 Loading stats from API...");
        const [mReq, tReq, sReq] = await Promise.all([getMoods(), getTasks(), getSleep()]);

        console.log("[Home] ✅ Moods fetched:", mReq.data.data?.length || 0, "items");
        console.log("[Home] ✅ Tasks fetched:", tReq.data.data?.length || 0, "items");
        console.log("[Home] ✅ Sleep fetched:", sReq.data.data?.length || 0, "items");

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
        console.log("[Home] ✅ Stats updated:", { mood: latestMood, pendingTasks, sleep: sleepStr });
      } catch (e) {
        console.error('[Home] ❌ Failed to load stats:', e.message, e.response?.data);
      }
    }
    loadStats();
    // Log daily app open for streak (no-op if already called today)
    logAppOpen().catch(() => { });
  }, []);

  const quickNav = [
    { id: 'mood-card', label: 'Mood', icon: <FiSmile size={20} />, color: '#179044', val: stats.mood },
    { id: 'task-card', label: 'Tasks', icon: <FiCheckSquare size={20} />, color: '#179044', val: stats.tasks },
    { id: 'sleep-card', label: 'Sleep', icon: <FiMoon size={20} />, color: '#179044', val: stats.sleep },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ paddingBottom: '90px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="vibrant-header">
        <h1 style={{ margin: 0 }}>Hello, {userName}!</h1>
        <p style={{ margin: '6px 0 0 0' }}>Let's make today great 🤍</p>
      </div>

      {/* Quick Navigation / Overview Cards (Glassmorphism + 3D) */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '12px' }}>
          {quickNav.map((n, idx) => (
            <div
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className="overview-soft-card"
            >
              <div className="overview-icon-circle">
                {n.icon}
              </div>
              <span className="overview-label">{n.label}</span>
            </div>
          ))}
          {/* AI Insight Card in Grid */}
          <div
            onClick={() => scrollTo('insight-card')}
            className="overview-soft-card"
          >
            <div className="overview-icon-circle">
              <BiBrain size={20} />
            </div>
            <span className="overview-label">Insight</span>
          </div>
        </div>
      </div>

      <div id="mood-card"><MoodCard /></div>
      <div id="task-card"><TaskCard /></div>
      <div id="sleep-card"><SleepCard /></div>

      {/* AI Insight Banner */}
      <div id="insight-card" style={{ padding: '0 16px', marginTop: '24px', marginBottom: '30px' }}>
        <div 
          onClick={() => navigate('/ai-suggestion')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(6, 197, 133, 0.15) 0%, rgba(1, 100, 67, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(6, 197, 133, 0.2)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(6, 197, 133, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(6, 197, 133, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(6, 197, 133, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.5)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #016443, #06c585)',
              padding: '12px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(6, 197, 133, 0.4)'
            }}>
              <HiSparkles size={24} color="white" />
            </div>
            <div>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: '800', 
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #016443, #06c585)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                AI Insight
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#6B7280', fontWeight: 500 }}>
                Get personalized daily recommendations
              </p>
            </div>
          </div>
          <div style={{
            background: 'rgba(6, 197, 133, 0.1)',
            padding: '10px 16px',
            borderRadius: '12px',
            color: '#06c585',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            Explore ✨
          </div>
        </div>
      </div>
    </div>
  );
}
