import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationCard from '../components/RecommendationCard';
import { FiArrowLeft, FiClock, FiCalendar } from 'react-icons/fi';
import { getRecommendation } from '../services/api';

export default function AISuggestion() {
  const navigate = useNavigate();
  
  const [suggestion, setSuggestion] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const res = await getRecommendation({ localHour: new Date().getHours() });
      if (res.data.suggestion) {
        setSuggestion(res.data.suggestion);
        setSchedule(res.data.schedule || []);
      } else {
        setSuggestion('Welcome! 😊 Please add your mood, a task, and your sleep first so I can give you personalized suggestions!');
        setSchedule([]);
      }
    } catch {
      setSuggestion('Welcome! 😊 Please add your mood, a task, and your sleep first so I can give you personalized suggestions!');
      setSchedule([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestion();
    const handleUpdate = () => fetchSuggestion();
    window.addEventListener('dashboardDataChanged', handleUpdate);
    return () => window.removeEventListener('dashboardDataChanged', handleUpdate);
  }, []);

  return (
    <div className="fade-in" style={{ padding: 0, paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="vibrant-header" style={{ position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            border: 'none', borderRadius: '12px',
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer'
          }}
        >
          <FiArrowLeft size={20} />
        </button>
        <h1>AI Insights &amp; Schedule</h1>
        <p>AI-powered daily insights &amp; schedule ✧</p>
      </div>

      <div style={{ padding: '0 16px' }}>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: AI Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#45B39D' }}>✧</span> Personalized Insights
            </h3>
            <RecommendationCard suggestion={suggestion} loading={loading} fetchSuggestion={fetchSuggestion} />
          </div>
        </div>

        {/* Right Column: Daily Task Scheduler */}
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar color="#6366F1" /> Daily Schedule
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>Today</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '24px', lineHeight: 1.5 }}>
            AI-optimized timeline based on your current task load and priority levels.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {/* Vertical Timeline Line */}
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#EEF2FF', zIndex: 0 }} />

            {schedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF' }}>
                Your schedule is clear! Let AI plan your tasks.
              </div>
            ) : (
              schedule.map((item, idx) => {
                const styles = {
                  do_now: { icon: "🔥", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", label: "Do Now" },
                  light: { icon: "🌿", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", label: "Light Effort" },
                  delay: { icon: "🕑", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", label: "Delay" },
                  rest: { icon: "🛌", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", label: "Rest" },
                };
                const type = styles[item.action] || { icon: "✨", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", label: item.action };

                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    {/* Timeline Dot */}
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#ffffff', 
                      border: `3px solid ${type.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: type.color }} />
                    </div>

                    {/* Task Card */}
                    <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '16px', padding: '16px', border: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <FiClock /> {item.time}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                        {item.task}
                      </div>
                      <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', 
                        background: type.bg,
                        color: type.color
                      }}>
                        {type.icon} {type.label}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
