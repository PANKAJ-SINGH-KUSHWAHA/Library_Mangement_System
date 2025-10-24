import { AlertCircle, BookOpen, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logout();
    showNotification("Successfully logged out", "success");
    setShowLogoutConfirm(false);
    navigate("/login");
  };


  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            } border-l-4 p-4 rounded-r-lg shadow-lg flex items-center gap-3 min-w-[320px]`}
          >
            <div className={`p-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 animate-fade-in" 
                 onClick={() => setShowLogoutConfirm(false)}></div>

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Logout
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to log out? You'll need to sign in again to access your account.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  onClick={confirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

                {user.role === "MEMBER" && (
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

                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <Link 
                    to="/users" 
                    className="text-white/90 hover:text-white font-medium transition-colors hover:scale-105 transform"
                  >
                    User Management
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

                {user.role === "MEMBER" && (
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

                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <Link 
                    to="/users" 
                    className="text-white font-medium px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    User Management
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
                    setIsMenuOpen(false);
                    handleLogout();
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