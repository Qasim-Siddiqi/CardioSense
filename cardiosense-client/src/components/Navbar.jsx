import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { fullName, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navLinks =
    role === "Patient"
      ? [
          { label: "Dashboard",      to: "/patient/dashboard" },
          { label: "New Submission", to: "/form"              },
        ]
      : [
          { label: "Dashboard", to: "/doctor/dashboard" },
        ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/20"
         style={{ background: "rgba(11,17,32,0.85)", backdropFilter: "blur(12px)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Main bar ── */}
      <div className="max-w-[1100px] mx-auto px-6 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-cyan-400 text-xl leading-none">♥</span>
          <span className="text-slate-200 font-bold text-base tracking-tight">CardioSense</span>
        </div>

        {/* ── Desktop nav links (hidden on mobile) ── */}
        <div className="hidden md:flex gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                "px-[14px] py-[6px] rounded-lg text-sm no-underline transition-all duration-150 " +
                (isActive
                  ? "font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                  : "font-normal text-slate-400 border border-transparent hover:text-slate-200")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* ── Desktop: user info + sign out (hidden on mobile) ── */}
        <div className="hidden md:flex items-center gap-[14px]">
          <div className="text-right">
            <div className="text-slate-200 text-[0.85rem] font-semibold leading-[1.2]">{fullName}</div>
            <div className="text-cyan-400 text-[0.68rem] tracking-[0.06em] uppercase">{role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-[7px] rounded-lg text-[0.8rem] font-semibold text-slate-400 bg-transparent border border-slate-400/20 cursor-pointer transition-all duration-150 hover:text-slate-200 hover:border-slate-400/40"
          >
            Sign Out
          </button>
        </div>

        {/* ── Mobile: hamburger button (hidden on desktop) ── */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-2 cursor-pointer bg-transparent border-none"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {/* Three bars animate into X when open */}
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 origin-center
            ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200
            ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 origin-center
            ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>

      </div>

      {/* ── Mobile dropdown (shown only when menuOpen) ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700/20 px-6 py-4 flex flex-col gap-2"
             style={{ background: "rgba(11,17,32,0.97)" }}>

          {/* Nav links */}
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                "px-3 py-2.5 rounded-lg text-sm no-underline transition-all duration-150 " +
                (isActive
                  ? "font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                  : "font-normal text-slate-400 border border-transparent hover:text-slate-200")
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Divider + user info + sign out */}
          <div className="border-t border-slate-700/30 mt-2 pt-3 flex items-center justify-between">
            <div>
              <div className="text-slate-200 text-sm font-semibold leading-[1.2]">{fullName}</div>
              <div className="text-cyan-400 text-[0.68rem] tracking-[0.06em] uppercase">{role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 bg-transparent border border-slate-400/20 cursor-pointer transition-all duration-150 hover:text-slate-200"
            >
              Sign Out
            </button>
          </div>

        </div>
      )}

    </nav>
  );
}
