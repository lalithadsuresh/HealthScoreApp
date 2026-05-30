import BottomNav from './BottomNav.jsx';

export default function AppLayout({ children, showNav = true }) {
  return (
    <div className="app-shell">
      <main className="page">{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
