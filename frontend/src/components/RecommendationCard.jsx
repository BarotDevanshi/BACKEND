import { HiSparkles } from 'react-icons/hi';
import { FiRefreshCw } from 'react-icons/fi';

export default function RecommendationCard({ suggestion, loading, fetchSuggestion }) {
  const defaultMessage = 'Welcome! 😊 Please add your mood, a task, and your sleep first so I can give you personalized suggestions!';

  return (
    <div style={{ padding: '0 16px', marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
      <div 
        className="ai-recommendation-glass"
        style={{
          width: '100%',
          maxWidth: '800px',
          background: 'linear-gradient(135deg, rgba(6, 197, 133, 0.15) 0%, rgba(1, 100, 67, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(6, 197, 133, 0.2)',
          borderRadius: '24px',
          padding: '28px',
          color: 'var(--text-primary)',
          boxShadow: '0 8px 32px rgba(6, 197, 133, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        {/* Animated Glow behind the glass */}
        <div 
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(6, 197, 133, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            borderRadius: '50%',
            animation: 'aiPulseGlow 4s infinite alternate',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #016443, #06c585)',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(6, 197, 133, 0.4)'
            }}>
              <HiSparkles size={22} color="white" />
            </div>
            <span style={{ 
              background: 'linear-gradient(135deg, #016443, #06c585)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 2px 10px rgba(6, 197, 133, 0.1)'
            }}>
              AI Insight
            </span>
          </div>
          <button 
            onClick={fetchSuggestion} 
            disabled={loading}
            style={{ 
              background: 'white',
              border: '1px solid rgba(6, 197, 133, 0.2)',
              borderRadius: '50%',
              color: '#06c585', 
              width: '40px',
              height: '40px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(6, 197, 133, 0.15)'
            }}
            onMouseOver={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(6, 197, 133, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 197, 133, 0.15)';
              }
            }}
          >
            <FiRefreshCw size={18} className={loading ? 'spinning' : ''} style={{ strokeWidth: '2.5' }} />
          </button>
        </div>

        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            fontSize: '1.05rem',
            lineHeight: '1.7',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'center', color: '#06c585', fontWeight: '600' }}>
              <div className="ai-dot-flashing"></div>
              <span>Crafting your personalized insight...</span>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                letterSpacing: '0.2px', 
                whiteSpace: 'pre-line',
                width: '100%',
                marginBottom: '0'
              }}>
                {suggestion || defaultMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        
        @keyframes aiPulseGlow {
          0% { transform: scale(0.8) translate(0, 0); opacity: 0.5; }
          100% { transform: scale(1.2) translate(-20px, 20px); opacity: 0.9; }
        }

        .ai-recommendation-glass:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(6, 197, 133, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.6) !important;
        }

        [data-theme="dark"] .ai-recommendation-glass {
          background: linear-gradient(135deg, rgba(6, 197, 133, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%) !important;
          border-color: rgba(6, 197, 133, 0.15) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(6, 197, 133, 0.05) !important;
        }

        [data-theme="dark"] .ai-recommendation-glass > div:nth-child(3) {
          background: rgba(30, 41, 59, 0.6) !important;
          border-color: rgba(255, 255, 255, 0.05) !important;
        }

        [data-theme="dark"] .ai-recommendation-glass button {
          background: #1e293b !important;
          border-color: rgba(6, 197, 133, 0.2) !important;
        }

        .ai-dot-flashing {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #06c585;
          color: #06c585;
          animation: ai-dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
          margin-right: 15px;
          margin-left: 5px;
        }
        .ai-dot-flashing::before, .ai-dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .ai-dot-flashing::before {
          left: -12px;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #06c585;
          color: #06c585;
          animation: ai-dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .ai-dot-flashing::after {
          left: 12px;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #06c585;
          color: #06c585;
          animation: ai-dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        @keyframes ai-dot-flashing {
          0% { background-color: #06c585; }
          50%, 100% { background-color: rgba(6, 197, 133, 0.2); }
        }
      `}</style>
    </div>
  );
}
