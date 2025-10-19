import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold">Library App</div>
      <div className="space-x-4">
        {!token ? (
          <>
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/register" className="hover:text-gray-300">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <button onClick={logout} className="hover:text-gray-300">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
