import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="nav-bottom">
      <NavLink to="/dashboard" end>
        <span className="nav-icon">🏠</span>
        Home
      </NavLink>
      <NavLink to="/scan">
        <span className="nav-icon">📷</span>
        Scan
      </NavLink>
      <NavLink to="/profile">
        <span className="nav-icon">⚙️</span>
        Profile
      </NavLink>
    </nav>
  );
}
