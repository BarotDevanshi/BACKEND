import { useState, useEffect } from 'react';
import { saveMood, getMoods } from '../services/api';
import { toast } from 'react-toastify';

const MOODS = [
  { icon: '😊', label: 'Happy', value: 'happy' },
  { icon: '😌', label: 'Neutral', value: 'neutral' },
  { icon: '😰', label: 'Stressed', value: 'stressed' },
  { icon: '😢', label: 'Sad', value: 'sad' },
];

export default function MoodCard() {
  const [selectedMood, setSelectedMood] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [nextAvailableTime, setNextAvailableTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    // Check if user can add mood based on last mood entry
    checkMoodAvailability();
  }, []);

  useEffect(() => {
    // Update remaining time every second
    if (isDisabled && nextAvailableTime) {
      const timer = setInterval(() => {
        updateRemainingTime();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDisabled, nextAvailableTime]);

  const updateRemainingTime = () => {
    if (!nextAvailableTime) return;
    
    const now = new Date().getTime();
    const diff = nextAvailableTime - now;
    
    if (diff <= 0) {
      setIsDisabled(false);
      setNextAvailableTime(null);
      setRemainingTime('');
      toast.info('You can add mood now! 🎉', { autoClose: 2000 });
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const checkMoodAvailability = async () => {
    try {
      const response = await getMoods();
      const moods = response.data.data || [];
      
      if (moods.length > 0) {
        const lastMood = moods[0];
        const lastMoodTime = new Date(lastMood.createdAt).getTime();
        const thirtyMinutesLater = lastMoodTime + 30 * 60 * 1000; // 30 minutes in milliseconds
        const now = new Date().getTime();
        
        if (now < thirtyMinutesLater) {
          // User needs to wait
          setIsDisabled(true);
          setNextAvailableTime(thirtyMinutesLater);
          updateRemainingTime();
        } else {
          setIsDisabled(false);
          setNextAvailableTime(null);
          setRemainingTime('');
        }
      }
    } catch (err) {
      console.error('[MoodCard] Error checking availability:', err);
    }
  };

  const handleSelect = async (moodValue, label) => {
    if (isDisabled) {
      toast.warning(`⏰ You can add mood in ${remainingTime}`, { autoClose: 3000 });
      return;
    }

    setSelectedMood(moodValue);
    try {
      console.log("[MoodCard] 📤 Sending mood data:", { mood: moodValue, note: "home" });
      const response = await saveMood({ mood: moodValue, note: "home" });
      console.log("[MoodCard] ✅ SAVED SUCCESSFULLY:", response.data);
      toast.success(`Feeling ${label} today. Checked in! ✨`);
      
      // Set the mood entry as disabled for the next 30 minutes
      const nextTime = new Date().getTime() + 30 * 60 * 1000;
      setIsDisabled(true);
      setNextAvailableTime(nextTime);
      
      // Notify other components
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch (err) {
      console.error("[MoodCard] ❌ SAVE FAILED:", err);
      console.error("[MoodCard] Error response:", err.response?.data);
      console.error("[MoodCard] Error message:", err.message);
      
      if (err.response?.status === 429 || err.response?.data?.error?.includes('30 minutes')) {
        toast.error(`⏰ Please wait before adding mood again`, { autoClose: 3000 });
        checkMoodAvailability(); // Re-check availability
      } else {
        toast.error("Failed to save your mood. Please try again.");
      }
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <span style={{ color: 'var(--primary-color)' }}>✨</span> How are you feeling?
      </h3>
      
      {isDisabled && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#FF9800',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeInUp 0.35s ease both'
        }}>
          ⏰ Next mood check in: <strong>{remainingTime}</strong>
        </div>
      )}
      
      <div className="mood-grid">
        {MOODS.map(m => (
          <button 
            key={m.value}
            className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`}
            onClick={() => handleSelect(m.value, m.label)}
            disabled={isDisabled}
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              pointerEvents: isDisabled ? 'auto' : 'auto'
            }}
            title={isDisabled ? `You can add mood again in ${remainingTime}` : 'Click to select mood'}
          >
            <div className="mood-emoji">{m.icon}</div>
            <div className="mood-label">{m.label}</div>
          </button>
        ))}
      </div>

      {isDisabled && (
        <div style={{
          marginTop: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          textAlign: 'center'
        }}>
          💡 You can track your mood once every 30 minutes
        </div>
      )}
    </div>
  );
}
