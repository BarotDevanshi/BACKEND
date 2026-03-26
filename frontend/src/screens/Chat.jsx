import { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendChat } from '../services/api';
import { BiBot } from 'react-icons/bi';
import { FiSend } from 'react-icons/fi';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    // Starting fresh every time the component opens as requested
    setMessages([
      { role: 'ai', text: 'Hi! I am your NeuroNexus assistant. How can I help you?', time: new Date().toLocaleTimeString([], {timeStyle: 'short'}) }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const time = new Date().toLocaleTimeString([], {timeStyle: 'short'});
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setLoading(true);

    try {
      const { data } = await sendChat({ message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: data.response, time: new Date().toLocaleTimeString([], {timeStyle: 'short'}) }]);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ paddingBottom: '70px' }}>
      <div className="gradient-header" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <h1>
          <BiBot />
          AI Assistant
        </h1>
        <p>Always here to help ☁️</p>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'right' : 'left'}`}>
            {msg.role === 'ai' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                <BiBot size={18} /> NeuroNexus
              </div>
            )}
            <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.7, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              {msg.time}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble left">
            Typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSend}>
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
  );
}
