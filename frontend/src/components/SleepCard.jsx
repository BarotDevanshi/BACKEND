import { useState, useEffect } from 'react';
import { saveSleep } from '../services/api';
import { FiMoon, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function SleepCard() {
  const [bedtime, setBedtime] = useState({ h: '10', m: '00', p: 'PM' });
  const [wakeTime, setWakeTime] = useState({ h: '07', m: '00', p: 'AM' });
  const [quality, setQuality] = useState('good');

  const to24 = (timeObj) => {
    let hrs = parseInt(timeObj.h);
    if (timeObj.p === 'PM' && hrs !== 12) hrs += 12;
    if (timeObj.p === 'AM' && hrs === 12) hrs = 0;
    return { h: hrs, m: parseInt(timeObj.m) };
  };

  useEffect(() => {
    let b = to24(bedtime);
    let w = to24(wakeTime);
    if (w.h < b.h || (w.h === b.h && w.m < b.m)) w.h += 24;
    let durationMins = (w.h * 60 + w.m) - (b.h * 60 + b.m);
    let hours = durationMins / 60;

    if (hours <= 4.9) {
      setQuality('poor');
    } else if (hours >= 5 && hours < 7) {
      setQuality('average');
    } else if (hours >= 7 && hours <= 9) {
      setQuality('good');
    } else {
      setQuality('extreme');
    }
  }, [bedtime, wakeTime]);


  const calculateDuration = () => {
    let b = to24(bedtime);
    let w = to24(wakeTime);

    if (w.h < b.h || (w.h === b.h && w.m < b.m)) w.h += 24;

    let durationMins = (w.h * 60 + w.m) - (b.h * 60 + b.m);
    let hours = Math.floor(durationMins / 60);
    let mins = durationMins % 60;

    return `${hours}h ${mins}m`;
  };

  const handleSave = async () => {
    try {
      const today = new Date();
      let b = to24(bedtime);
      let w = to24(wakeTime);

      const sleepDate = new Date(today);
      sleepDate.setHours(b.h, b.m, 0, 0);

      const wakeDate = new Date(today);
      wakeDate.setHours(w.h, w.m, 0, 0);

      if (wakeDate <= sleepDate) wakeDate.setDate(wakeDate.getDate() + 1);

      await saveSleep({
        sleepTime: sleepDate.toISOString(),
        wakeTime: wakeDate.toISOString(),
        quality
      });
      toast.success('Sleep tracked successfully! 💤');
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch (e) {
      console.error("[SleepCard ERROR] Failed to save sleep data:", e);
      toast.error('Failed to save sleep data.');
    }
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minsList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const TimePicker = ({ label, icon, val, setVal }) => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
        {label} {icon}
      </label>
      <div style={{ display: 'flex', gap: '4px' }}>
        <select
          value={val.h}
          onChange={e => setVal({ ...val, h: e.target.value })}
          style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '0.9rem', outline: 'none' }}
        >
          {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span style={{ alignSelf: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>:</span>
        <select
          value={val.m}
          onChange={e => setVal({ ...val, m: e.target.value })}
          style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '0.9rem', outline: 'none' }}
        >
          {minsList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={val.p}
          onChange={e => setVal({ ...val, p: e.target.value })}
          style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '0.9rem', outline: 'none', fontWeight: 700 }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="card">
      <h3 className="card-title">
        <FiMoon style={{ color: '#6366F1' }} /> Sleep Tracker
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        <TimePicker label="Bedtime" icon="🌙" val={bedtime} setVal={setBedtime} />
        <TimePicker label="Wake Time" icon="☀️" val={wakeTime} setVal={setWakeTime} />
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
        {['good', 'average', 'poor', 'extreme'].map(q => (
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
          background: '#03553a', color: 'white', fontWeight: 600, fontSize: '1rem'
        }}
        onClick={handleSave}
      >
        Save Sleep Data
      </button>
    </div>
  );
}
