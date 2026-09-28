import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/appointments", label: "My Appointments" }
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-brand-700 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold">MavizC.Ai</h1>
          <p className="text-xs text-white/60">Doctor Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-sm">
          <p className="text-white/60 truncate">{user?.email}</p>
          <p className="text-white/40 text-xs mb-3">Doctor</p>
          <button onClick={handleLogout} className="w-full text-left text-white/80 hover:text-white text-sm">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
