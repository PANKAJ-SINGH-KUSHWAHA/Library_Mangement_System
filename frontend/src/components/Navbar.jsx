import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-xl">Librario</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/" className="font-medium">{user.firstName}</Link>
            <Link to="/books">Books</Link>
            <Link
              to="/settings"
              className="text-blue-600 hover:underline"
            >
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
