import { NavLink } from "react-router-dom";

// Sidebar personnalisée VeraHospital
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">∞</div>

        <div>
          <strong>VeraHospital</strong>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Votre santé, notre priorité
          </div>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          ⬛ Tableau de bord
        </NavLink>

        <NavLink to="/patients" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          👤 Patients
        </NavLink>

        <NavLink to="/doctors" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          🧑‍⚕️ Médecins
        </NavLink>

        <NavLink to="/appointments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          📅 Rendez-vous
        </NavLink>

        <NavLink to="/billing" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          💳 Facturation
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          🕘 Historique Patient
        </NavLink>
      </nav>

      <div className="sidebar-sep"></div>

      <nav className="nav">
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          ⚙️ Settings
        </NavLink>
      </nav>
    </aside>
  );
}