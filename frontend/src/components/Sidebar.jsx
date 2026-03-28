import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiMessageCircle, FiUser } from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';

export default function Sidebar() {
  const tabs = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'AI Chat' },
    { path: '/games', icon: <IoGameControllerOutline />, label: 'Games' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">NN</div>
        <span>NeuroNexus</span>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            end={tab.path === '/'}
          >
            <span className="sidebar-icon">{tab.icon}</span>
            <span className="sidebar-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>© 2026 NeuroNexus</p>
      </div>
    </aside>
  );
}
