import { useState } from 'react';
import { saveSleep } from '../services/api';
import { FiMoon, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function SleepCard() {
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState('good');

  const calculateDuration = () => {
    let [bH, bM] = bedtime.split(':').map(Number);
    let [wH, wM] = wakeTime.split(':').map(Number);
    
    if (wH < bH) wH += 24;
    
    let durationMins = (wH * 60 + wM) - (bH * 60 + bM);
    let hours = Math.floor(durationMins / 60);
    let mins = durationMins % 60;
    
    return `${hours}h ${mins}m`;
  };

  const handleSave = async () => {
    try {
      const today = new Date();
      const [bH, bM] = bedtime.split(':').map(Number);
      const sleepDate = new Date(today);
      sleepDate.setHours(bH, bM, 0, 0);

      const [wH, wM] = wakeTime.split(':').map(Number);
      const wakeDate = new Date(today);
      wakeDate.setHours(wH, wM, 0, 0);
      // If wake time is before bedtime, it crosses midnight
      if (wakeDate <= sleepDate) wakeDate.setDate(wakeDate.getDate() + 1);

      await saveSleep({
        sleepTime: sleepDate.toISOString(),
        wakeTime: wakeDate.toISOString(),
        quality
      });
      toast.success('Sleep tracked successfully! 💤');
    } catch (e) {
      toast.error('Failed to save sleep data.');
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <FiMoon style={{ color: '#6366F1' }} /> Sleep Tracker
      </h3>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
            Bedtime 🌙
          </label>
          <div className="input-container" style={{ height: '44px' }}>
            <input 
              type="time" 
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
            Wake Time ☀️
          </label>
          <div className="input-container" style={{ height: '44px' }}>
            <input 
              type="time" 
              value={wakeTime}
              onChange={e => setWakeTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'var(--blue-light)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <FiClock style={{ color: '#6366F1' }} /> Sleep Duration
        </div>
        <div style={{ color: '#6366F1', fontWeight: 600 }}>
          {calculateDuration()}
        </div>
      </div>

      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
        Sleep Quality
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['good', 'average', 'poor'].map(q => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              background: quality === q ? 'var(--green-button)' : 'var(--bg-input)',
              color: quality === q ? 'white' : 'var(--text-primary)',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <button 
        style={{
          width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
          background: '#6366F1', color: 'white', fontWeight: 600, fontSize: '1rem'
        }}
        onClick={handleSave}
      >
        Save Sleep Data
      </button>
    </div>
  );
}
