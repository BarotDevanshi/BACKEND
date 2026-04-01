import { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/api';
import { FiCheck, FiChevronRight } from 'react-icons/fi';

export default function TaskCard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [showClearNotif, setShowClearNotif] = useState(true);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data.data || []);
    } catch { }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const selectedPriority = priority;
    try {
      await addTask({ title: newTask, priority: selectedPriority });
      setNewTask('');
      setPriority('medium');
      loadTasks();
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch { }
  };

  const handleToggle = async (id, status) => {
    if (status === 'completed') return; // Cannot uncheck
    try {
      await updateTask(id, { status: 'completed' });
      loadTasks();
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch { }
  };

  const currentTasks = tasks.filter(t => t.status !== 'completed');

  // For completed logic, only show today's completed by default
  const completedTasks = tasks.filter(t => {
    if (t.status === 'completed') {
      const updatedAt = new Date(t.updatedAt || t.createdAt);
      if (now - updatedAt > 24 * 60 * 60 * 1000) return false;
      return true;
    }
    return false;
  });

  const isEndOfDay = now.getHours() >= 20;

  // Render Pill Color Helper
  const getPillStyle = (p) => {
    switch (p) {
      case 'high': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'medium': return { bg: '#FEF3C7', color: '#D97706' };
      case 'low': return { bg: '#D1FAE5', color: '#059669' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div className="card">
      <h2 className="card-title" style={{ fontSize: '1.4rem', margin: '0 0 20px 0' }}>
        Task Dumpyard
      </h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Dump a task here..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            flex: '1',
            minWidth: '200px',
            background: '#F9FAFB',
            borderRadius: '24px',
            border: 'none',
            padding: '14px 20px',
            fontSize: '1rem',
            color: '#1F2937',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Priority Selectors */}
          {['high', 'medium', 'low'].map(p => {
            const isActive = priority === p;
            let activeStyle = {};
            if (isActive) {
              if (p === 'high') activeStyle = { border: '2px solid #FCA5A5', color: '#EF4444', fontWeight: '600' };
              else if (p === 'medium') activeStyle = { border: '2px solid #FCD34D', color: '#F59E0B', fontWeight: '600' };
              else activeStyle = { border: '2px solid #6EE7B7', color: '#10B981', fontWeight: '600' };
            }
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                style={{
                  background: isActive ? (p === 'medium' ? '#FEF3C7' : p === 'high' ? '#FEF2F2' : '#ECFDF5') : 'transparent',
                  border: isActive ? activeStyle.border : 'none',
                  color: isActive ? activeStyle.color : '#6B7280',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {p === 'medium' ? 'Med' : p}
              </button>
            );
          })}

          <button type="submit" style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#45B39D',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            cursor: 'pointer',
            marginLeft: '8px',
            boxShadow: '0 2px 8px rgba(69, 179, 157, 0.4)'
          }}>
            +
          </button>
        </div>
      </form>

      {/* Pending Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {currentTasks.map(task => {
          const p = task.priority || 'medium';
          const style = getPillStyle(p);

          return (
            <div
              key={task._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                background: '#F9FAFB',
                borderRadius: '20px',
                gap: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={() => handleToggle(task._id, task.status)}
            >
              <div
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: '2px solid #A7F3D0',
                  background: 'transparent',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: '1.05rem', color: '#1F2937', fontWeight: 500 }}>
                {task.title}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '4px 12px',
                borderRadius: '12px',
                background: style.bg,
                color: style.color,
                textTransform: 'capitalize',
              }}>
                {p}
              </span>
              <FiChevronRight color="#9CA3AF" />
            </div>
          );
        })}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#3c3838ff', fontWeight: '500', marginBottom: '16px' }}>
            Completed ({completedTasks.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedTasks.map(task => (
              <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                <FiCheck color="#34D399" size={20} />
                <span style={{ color: '#9CA3AF', textDecoration: 'line-through', fontSize: '1rem', fontWeight: 500 }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evening Review Notification */}
      {isEndOfDay && completedTasks.length > 0 && showClearNotif && (
        <div style={{ background: '#EEF2FF', borderRadius: '12px', padding: '16px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4338CA' }}>Review your day</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6366F1', marginTop: '4px' }}>Clear {completedTasks.length} tasks?</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowClearNotif(false)} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer' }}>Dismiss</button>
            <button
              onClick={async () => {
                try {
                  await Promise.all(completedTasks.map(t => deleteTask(t._id)));
                  setShowClearNotif(false);
                  loadTasks();
                } catch { }
              }}
              style={{ background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}