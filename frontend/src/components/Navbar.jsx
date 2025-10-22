import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, User, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
            <BookOpen className="w-8 h-8" />
            <span className="font-bold text-2xl tracking-tight">Librario</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/books" 
                  className="text-white/90 hover:text-white font-medium transition-colors hover:scale-105 transform"
                >
                  Books
                </Link>

                {user.role === "USER" && (
                  <Link 
                    to="/my-borrows" 
                    className="text-white/90 hover:text-white font-medium transition-colors hover:scale-105 transform"
                  >
                    My Borrowed Books
                  </Link>
                )}

                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <Link 
                    to="/manage-books" 
                    className="text-white/90 hover:text-white font-medium transition-colors hover:scale-105 transform"
                  >
                    Manage Books
                  </Link>
                )}

                {/* User Profile Section */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/30">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-white font-semibold">{user.firstName}</span>
                  </div>

                  <Link 
                    to="/settings"
                    className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 transform shadow-lg"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-white/90 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-all hover:scale-105 transform shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">{user.firstName}</span>
                </div>

                <Link 
                  to="/books" 
                  className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Books
                </Link>

                {user.role === "USER" && (
                  <Link 
                    to="/my-borrows" 
                    className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Borrowed Books
                  </Link>
                )}

                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <Link 
                    to="/manage-books" 
                    className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Manage Books
                  </Link>
                )}

                <Link 
                  to="/settings"
                  className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors w-full justify-center mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 font-semibold px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;