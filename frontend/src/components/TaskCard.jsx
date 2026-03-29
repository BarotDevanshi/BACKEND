import { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/api';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';

const PRIORITY_COLORS = {
  high:   { bg: '#FEE2E2', color: '#DC2626', border: '#DC2626' },
  medium: { bg: '#FEF3C7', color: '#D97706', border: '#D97706' },
  low:    { bg: '#D1FAE5', color: '#059669', border: '#059669' },
};

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
    } catch {}
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const selectedPriority = priority; // capture current value
    try {
      await addTask({ title: newTask, priority: selectedPriority });
      setNewTask('');
      setPriority('medium');
      loadTasks();
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch {}
  };

  const handleToggle = async (id, status) => {
    if (status === 'completed') return; // Cannot uncheck
    try {
      await updateTask(id, { status: 'completed' });
      loadTasks();
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
      window.dispatchEvent(new Event('dashboardDataChanged'));
    } catch {}
  };

  const visibleTasks = tasks.filter(t => {
    if (t.status === 'completed') {
      const updatedAt = new Date(t.updatedAt || t.createdAt);
      // Hide if older than 24 hours
      if (now - updatedAt > 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const completedVisible = visibleTasks.filter(t => t.status === 'completed');
  // Show clear notification if it's 8 PM or later
  const isEndOfDay = now.getHours() >= 20;

  return (
    <div className="card">
      <h3 className="card-title">
        <span style={{ color: 'var(--blue-button)' }}><BiTask /></span> Task Dumpyard
      </h3>

      <form onSubmit={handleAdd} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border)',
            padding: '14px 16px',
            marginBottom: '12px',
            fontSize: '1rem',
            color: 'var(--text-primary)',
          }}
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              flex: 1,
              background: PRIORITY_COLORS[priority]?.bg || '#fff',
              border: `1.5px solid ${PRIORITY_COLORS[priority]?.border || '#ccc'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0 12px',
              color: PRIORITY_COLORS[priority]?.color || 'var(--text-primary)',
              fontWeight: '600',
              height: '42px',
            }}
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>

          <button type="submit" className="btn-blue">
            + Add
          </button>
        </div>
      </form>

      {isEndOfDay && completedVisible.length > 0 && showClearNotif && (
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.1)' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#4338CA' }}>🌙 Evening Review</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6366F1', marginTop: '2px' }}>You have {completedVisible.length} completed {completedVisible.length === 1 ? 'task' : 'tasks'}. Clear them for tomorrow?</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowClearNotif(false)} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.75rem', cursor: 'pointer', padding: '4px' }}>Dismiss</button>
            <button
              onClick={async () => {
                try {
                  await Promise.all(completedVisible.map(t => deleteTask(t._id)));
                  setShowClearNotif(false);
                  loadTasks();
                } catch {}
              }}
              style={{ background: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
            >
              Clear Now
            </button>
          </div>
        </div>
      )}

      {visibleTasks.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px 0', fontSize: '0.9rem' }}>
          No tasks yet. Start dumping your thoughts! 💭
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleTasks.map(task => {
            const p = task.priority || 'medium';
            const pc = PRIORITY_COLORS[p] || PRIORITY_COLORS.medium;
            return (
              <div
                key={task._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  gap: '12px',
                  borderLeft: `4px solid ${pc.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}
              >
                <button
                  onClick={() => handleToggle(task._id, task.status)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: `2px solid ${task.status === 'completed' ? 'var(--green-button)' : '#CBD5E1'}`,
                    background: task.status === 'completed' ? 'var(--green-button)' : 'transparent',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {task.status === 'completed' && <FiCheck size={14} />}
                </button>

                <span style={{
                  flex: 1,
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? '#9CA3AF' : '#1F2937',
                  fontSize: '0.95rem',
                }}>
                  {task.title}
                </span>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: pc.bg,
                  color: pc.color,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.03em',
                }}>
                  {p}
                </span>

                <button
                  onClick={() => handleDelete(task._id)}
                  style={{ color: '#EF4444', background: 'transparent', padding: '4px', flexShrink: 0 }}
                >
                  <FiTrash2 />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
