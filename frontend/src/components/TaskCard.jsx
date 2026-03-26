import { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/api';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';

export default function TaskCard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    loadTasks();
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
    try {
      await addTask({ title: newTask, priority });
      setNewTask('');
      loadTasks();
    } catch {}
  };

  const handleToggle = async (id, status) => {
    try {
      await updateTask(id, { status: status === 'pending' ? 'completed' : 'pending' });
      loadTasks();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch {}
  };

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
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            padding: '14px 16px',
            marginBottom: '12px',
            fontSize: '1rem',
          }}
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 12px',
              color: 'var(--text-primary)'
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <button type="submit" className="btn-blue">
            + Add
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px 0', fontSize: '0.9rem' }}>
          No tasks yet. Start dumping your thoughts! 💭
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map(task => (
            <div 
              key={task._id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: 'var(--bg-input)',
                borderRadius: '8px',
                gap: '12px'
              }}
            >
              <button 
                onClick={() => handleToggle(task._id, task.status)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: `2px solid ${task.status === 'completed' ? 'var(--green-button)' : 'var(--text-tertiary)'}`,
                  background: task.status === 'completed' ? 'var(--green-button)' : 'transparent',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {task.status === 'completed' && <FiCheck size={14} />}
              </button>
              
              <span style={{ 
                flex: 1, 
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)'
              }}>
                {task.title}
              </span>

              <button 
                onClick={() => handleDelete(task._id)}
                style={{ color: '#EF4444', background: 'transparent', padding: '4px' }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
