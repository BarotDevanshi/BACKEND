import { useState, useEffect } from 'react';
import { getMoods, getTasks, getSleep } from '../services/api';
import { BiBrain } from 'react-icons/bi';

export default function AIInsightCard() {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateInsight() {
      try {
        const [moodRes, taskRes, sleepRes] = await Promise.all([
          getMoods(),
          getTasks(),
          getSleep(),
        ]);

        const moods = moodRes.data.data || [];
        const tasks = taskRes.data.data || [];
        const sleepData = sleepRes.data.data || [];

        // Generate AI Insight based on data
        let insight_text = 'Keep going!';
        
        if (moods.length > 0) {
          const recentMood = moods[0]?.mood || 'unknown';
          const moodCount = {
            happy: moods.filter(m => m.mood === 'happy').length,
            stressed: moods.filter(m => m.mood === 'stressed').length,
            sad: moods.filter(m => m.mood === 'sad').length,
          };

          const tasks_completed = tasks.filter(t => t.status === 'completed').length;
          const tasks_pending = tasks.filter(t => t.status !== 'completed').length;

          // AI Logic to generate insights
          if (moodCount.stressed > moodCount.happy) {
            insight_text = `You seem stressed lately. Try some relaxation 🧘`;
          } else if (moodCount.happy > 2) {
            insight_text = `You're having a great time! Keep it up! 🎉`;
          } else if (tasks_completed > tasks_pending) {
            insight_text = `Amazing productivity today! 📈`;
          } else if (tasks_pending > 5) {
            insight_text = `Focus on priorities this week 🎯`;
          } else if (recentMood === 'neutral') {
            insight_text = `Take a break and recharge ⚡`;
          } else {
            insight_text = `You're doing great today! 💪`;
          }
        }

        setInsight(insight_text);
      } catch (err) {
        console.error('[AIInsightCard] Error:', err);
        setInsight('Keep pushing forward! 🌟');
      } finally {
        setLoading(false);
      }
    }

    generateInsight();
  }, []);

  return (
    <div
      className="ai-insight-card"
      onClick={() => {
        // Optional: Add onclick functionality like opening detailed insights
        console.log('AI Insight clicked');
      }}
    >
      <div className="ai-icon">
        <BiBrain />
      </div>
      <div className="ai-insight-label">AI Insight</div>
      <div className="ai-insight-value">
        {loading ? 'Analyzing...' : insight}
      </div>
    </div>
  );
}
