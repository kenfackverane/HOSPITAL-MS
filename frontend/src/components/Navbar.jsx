import { Link } from "react-router-dom";

// Barre de navigation simple
export default function Navbar() {
  return (
    <nav style={{ marginBottom: 20 }}>
      <Link to="/">Dashboard</Link> |{" "}
      <Link to="/patients">Patients</Link>
    </nav>
  );
}
