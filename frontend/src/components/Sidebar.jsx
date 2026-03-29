import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiMessageCircle, FiUser } from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const isCollapsed = width < 120;

  const tabs = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'AI Chat' },
    { path: '/games', icon: <IoGameControllerOutline />, label: 'Games' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 70 && newWidth <= 400) {
        setWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <aside className="sidebar" style={{ width: `${width}px`, minWidth: `${width}px` }}>
      <div className="sidebar-logo" style={{ padding: isCollapsed ? '0' : '0 12px' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: isCollapsed ? '45px' : '110px', 
            height: 'auto', 
            transition: 'width 0.3s ease' 
          }} 
        />
        {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>NeuroNexus</span>}
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            end={tab.path === '/'}
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '14px 0' : '14px 16px'
            }}
          >
            <span className="sidebar-icon">{tab.icon}</span>
            {!isCollapsed && <span className="sidebar-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{tab.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <p>© 2026 NeuroNexus</p>
      </div>

      <div className="resize-handle" onMouseDown={startResizing} />
    </aside>
  );
}
