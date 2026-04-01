import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiMessageCircle, FiUser } from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { BiBrain } from 'react-icons/bi';

export default function BottomNav() {
  const tabs = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'AI Chat' },
    { path: '/games', icon: <IoGameControllerOutline />, label: 'Games' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={tab.path === '/'}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
