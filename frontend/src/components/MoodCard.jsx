import { useState } from 'react';
import { saveMood } from '../services/api';
import { toast } from 'react-toastify';

const MOODS = [
  { icon: '😊', label: 'Happy', value: 'happy' },
  { icon: '😌', label: 'Calm', value: 'neutral' },
  { icon: '😰', label: 'Stressed', value: 'stressed' },
  { icon: '😢', label: 'Sad', value: 'sad' },
];

export default function MoodCard() {
  const [selectedMood, setSelectedMood] = useState('');

  const handleSelect = async (moodValue, label) => {
    setSelectedMood(moodValue);
    try {
      await saveMood({ mood: moodValue, note: "" });
      toast.success(`Feeling ${label} today. Checked in!`);
      // Notify other components (like RecommendationCard) to update
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch {}
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <span style={{ color: 'var(--primary-color)' }}>✨</span> How are you feeling?
      </h3>
      
      <div className="mood-grid">
        {MOODS.map(m => (
          <button 
            key={m.value}
            className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`}
            onClick={() => handleSelect(m.value, m.label)}
          >
            <div className="mood-emoji">{m.icon}</div>
            <div className="mood-label">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
