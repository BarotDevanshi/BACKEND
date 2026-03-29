import { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendChat } from '../services/api';
import { BiBot } from 'react-icons/bi';
import { FiSend } from 'react-icons/fi';

// Exactly 4 predefined quick questions shown above the input
const QUICK_QUESTIONS = [
  "How can I improve my mood?",
  "Suggest a plan for today",
  "Motivate me to work",
  "Analyze my progress",
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    // Prevent the main app container from scrolling while in Chat
    const parent = document.querySelector('.app-content');
    if (parent) {
      const originalOverflow = parent.style.overflow;
      parent.style.overflow = 'hidden';
      return () => { parent.style.overflow = originalOverflow; };
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    setMessages([
      {
        role: 'ai',
        text: 'Hi! I am your NeuroNexus assistant. How can I help you?',
        time: new Date().toLocaleTimeString([], { timeStyle: 'short' }),
      },
    ]);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = text;
    const time = new Date().toLocaleTimeString([], { timeStyle: 'short' });
    setMessages((prev) => [...prev, { role: 'user', text: userMsg, time }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await sendChat({ message: userMsg });
      if (data && data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.response,
            time: new Date().toLocaleTimeString([], { timeStyle: 'short' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Sorry, I could not connect. Please try again! 💙',
          time: new Date().toLocaleTimeString([], { timeStyle: 'short' }),
        },
      ]);
    }
    setLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header — Fixed at top of flex */}
      <div
        className="gradient-header"
        style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, flexShrink: 0 }}
      >
        <h1>
          <BiBot />
          AI Assistant
        </h1>
        <p>Always here to help ☁️</p>
      </div>

      {/* Chat Messages — Scrollable area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'right' : 'left'}`}>
            {msg.role === 'ai' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  color: 'var(--primary-color)',
                  fontWeight: 'bold',
                }}
              >
                <BiBot size={18} /> NeuroNexus
              </div>
            )}
            <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
            <div
              style={{
                fontSize: '0.75rem',
                marginTop: '6px',
                opacity: 0.7,
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}
            >
              {msg.time}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble left">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--primary-color)',
                fontWeight: 'bold',
                marginBottom: '4px',
              }}
            >
              <BiBot size={18} /> NeuroNexus
            </div>
            Typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Footer Section — Chips + Input ───────────────────────────── */}
      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          margin: '0 auto',
          padding: '0 16px',
          zIndex: 999,
          flexShrink: 0,
          background: 'var(--bg-primary)'
        }}
      >
        {/* Quick Questions Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 0',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
          }}
        >
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(q)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--primary-color)',
                background: 'transparent',
                color: 'var(--primary-color)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'normal',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--primary-color)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar — Attached below chips */}
        <form 
          className="chat-input-container" 
          onSubmit={handleSend}
          style={{
            position: 'static', // override fixed in CSS to flow with footer
            maxWidth: 'none',
            padding: '10px 0 20px',
            background: 'var(--bg-primary)',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}
