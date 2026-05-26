// Navbar.jsx
// Concepts covered:
//   useAuth()    — reading fullName, role, logout from context
//   useNavigate  — programmatic navigation on sign out
//   NavLink      — like <Link> but knows if its route is active (for highlight)
//   props/state  — role decides which links render (conditional rendering)

import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { fullName, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();               // clears token + state in AuthContext
    navigate("/login");     // send user to login page
  }

  // Patient gets two links; Doctor gets one.
  // This is just an array rendered with .map() — same pattern used elsewhere.
  const navLinks =
    role === "Patient"
      ? [
          { label: "Dashboard",       to: "/patient/dashboard" },
          { label: "New Submission",  to: "/form"              },
        ]
      : [
          { label: "Dashboard", to: "/doctor/dashboard" },
        ];

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>

        {/* ── Logo ── */}
        <div style={logoStyle} onClick={() => navigate("/")}>
          <span style={{ color: "#22d3ee", fontSize: "1.3rem", lineHeight: 1 }}>♥</span>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            CardioSense
          </span>
        </div>

        {/* ── Nav links ── */}
        {/* NavLink's style prop accepts a function — React Router passes { isActive }
            so we can style the active route differently without extra state */}
        <div style={{ display: "flex", gap: 4 }}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#22d3ee" : "#94a3b8",
                background: isActive ? "rgba(34,211,238,0.1)" : "transparent",
                border: isActive ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* ── User info + Sign Out ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

          {/* Name + role badge stacked */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>
              {fullName}
            </div>
            <div style={{ color: "#22d3ee", fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {role}
            </div>
          </div>

          <button onClick={handleLogout} style={signOutStyle}>
            Sign Out
          </button>
        </div>

      </div>
    </nav>
  );
}

// ── Styles ──

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(11,17,32,0.85)",     // #0b1120 at 85% opacity
  backdropFilter: "blur(12px)",           // frosted glass effect
  borderBottom: "1px solid rgba(148,163,184,0.1)",
  fontFamily: "'DM Sans', sans-serif",
};

const innerStyle = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 24px",
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

const signOutStyle = {
  padding: "7px 16px",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#94a3b8",
  background: "transparent",
  border: "1px solid rgba(148,163,184,0.2)",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.15s",
};
