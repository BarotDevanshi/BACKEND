import { useState, useEffect } from 'react';
import { getRecommendation } from '../services/api';
import { HiSparkles } from 'react-icons/hi';
import { FiRefreshCw } from 'react-icons/fi';

export default function RecommendationCard() {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const res = await getRecommendation();
      setSuggestion(res.data.suggestion);
    } catch {
      setSuggestion('Log your mood first to get smart suggestions! 🧠');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <div style={{ padding: '0 16px', marginBottom: '20px' }}>
      <div 
        style={{
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          borderRadius: '20px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(236, 72, 153, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <HiSparkles size={22} />
            AI Suggestion
          </div>
          <button 
            onClick={fetchSuggestion} 
            disabled={loading}
            style={{ 
              background: 'transparent', 
              color: 'white', 
              padding: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <FiRefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {loading ? 'Analyzing your day...' : <div style={{ display: 'flex', gap: '10px' }}>{suggestion}</div>}
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
