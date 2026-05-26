import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import InstallAppButton from "./InstallAppButton.jsx";

const links = [
  { path: "/", label: "Dashboard", end: true },
  { path: "/tutor", label: "AI Tutor Chat" },
  { path: "/speaking", label: "Speaking Practice" },
  { path: "/roleplay", label: "Roleplay Practice" },
  { path: "/lessons", label: "Daily Lessons" },
  { path: "/progress", label: "Progress" },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Spoken English</p>
            <strong>Tutor</strong>
          </div>
        </div>
        <nav className="main-nav" aria-label="Main menu">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              end={link.end}
              key={link.path}
              to={link.path}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <InstallAppButton compact />
          <small>Signed in as</small>
          <span title={user?.email}>{user?.email}</span>
          <button className="ghost-button" onClick={handleSignOut} type="button">
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
