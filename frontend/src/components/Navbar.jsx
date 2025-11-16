// src/components/Navbar.jsx
import { AlertCircle, BookOpen, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient"; // adjust path if needed

// Inject small keyframes once
const NAV_STYLE_ATTR = "data-navbar-styles";
if (!document.head.querySelector(`[${NAV_STYLE_ATTR}]`)) {
  const style = document.createElement("style");
  style.setAttribute(NAV_STYLE_ATTR, "true");
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .animate-slide-in { animation: slideIn 0.28s ease-out forwards; }
    .animate-fade-in { animation: fadeIn 0.18s ease-out forwards; }
  `;
  document.head.appendChild(style);
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  // unpaid fines count (for admin/librarian -> global unpaid, for member -> their unpaid)
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await logout();
    showNotification("Successfully logged out", "success");
    setShowLogoutConfirm(false);
    setUnpaidCount(0);
    navigate("/login");
  };

  // Fetch unpaid fines count depending on role
  const fetchUnpaidCount = async () => {
    if (!user) {
      setUnpaidCount(0);
      return;
    }

    setLoadingUnpaid(true);
    try {
      if (user.role === "ADMIN" || user.role === "LIBRARIAN") {
        // admin view: global unpaid fines
        const res = await api.get("/borrow/admin/unpaid-fines");
        const data = res.data || [];
        setUnpaidCount(Array.isArray(data) ? data.length : 0);
      } else if (user.role === "MEMBER") {
        const res = await api.get("/fines/my/unpaid");
        const data = res.data || [];
        setUnpaidCount(Array.isArray(data) ? data.length : 0);
      } else {
        setUnpaidCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch unpaid fines:", err);
      setUnpaidCount(0);
    } finally {
      setLoadingUnpaid(false);
    }
  };

  // fetch on mount and whenever user changes
  useEffect(() => {
    fetchUnpaidCount();
    // optional: poll every minute
    // const id = setInterval(fetchUnpaidCount, 60_000);
    // return () => clearInterval(id);
  }, [user]);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      {/* Small toast notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            } border-l-4 p-4 rounded-r-lg shadow-lg flex items-center gap-3 min-w-[320px]`}
          >
            <div className={`p-2 rounded-full ${notification.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 animate-fade-in" onClick={() => setShowLogoutConfirm(false)} />
            <div className="relative inline-block w-full max-w-md p-6 bg-white rounded-2xl shadow-xl animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
                  <p className="mt-2 text-sm text-gray-500">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm">
                  Cancel
                </button>
                <button onClick={confirmLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
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

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/books" className="text-white/90 hover:text-white font-medium">Books</Link>

                {/* Member-only links */}
                {user.role === "MEMBER" && (
                  <>
                    <Link to="/my-borrows" className="text-white/90 hover:text-white font-medium">My Borrowed Books</Link>

                    {/* My Fines */}
                    <Link to="/my-fines" className="relative text-white/90 hover:text-white font-medium flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="hidden md:inline">My Fines</span>
                      {unpaidCount > 0 && (
                        <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unpaidCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Admin / Librarian links */}
                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <>
                    <Link to="/manage-books" className="text-white/90 hover:text-white font-medium">Manage Books</Link>
                    <Link to="/users" className="text-white/90 hover:text-white font-medium">User Management</Link>

                    {/* Admin fines with badge */}
                    <Link to="/admin/fines" className="relative text-white/90 hover:text-white font-medium flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="hidden md:inline">Fines</span>
                      {unpaidCount > 0 && (
                        <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unpaidCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* User profile & actions */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/30">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-white font-semibold">{user.firstName}</span>
                  </div>

                  <Link to="/settings" className="text-white/90 hover:text-white p-2 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </Link>

                  <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-white/90 hover:text-white font-medium">Login</Link>
                <Link to="/register" className="bg-white text-indigo-600 font-semibold px-5 py-2 rounded-lg">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">{user.firstName}</span>
                </div>

                <Link to="/books" className="text-white px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Books</Link>

                {user.role === "MEMBER" && (
                  <>
                    <Link to="/my-borrows" className="text-white px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>My Borrowed Books</Link>

                    <Link to="/my-fines" className="relative text-white px-4 py-3 hover:bg-white/10 rounded-lg flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span>My Fines</span>
                      </div>
                      {unpaidCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unpaidCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {(user.role === "ADMIN" || user.role === "LIBRARIAN") && (
                  <>
                    <Link to="/manage-books" className="text-white px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Manage Books</Link>
                    <Link to="/users" className="text-white px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>User Management</Link>

                    <Link to="/admin/fines" className="relative text-white px-4 py-3 hover:bg-white/10 rounded-lg flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span>Fines</span>
                      </div>
                      {unpaidCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unpaidCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <Link to="/settings" className="text-white px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Settings</Link>

                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="bg-red-500 text-white px-4 py-3 rounded-lg w-full">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" className="text-white text-center px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="bg-white text-indigo-600 font-semibold px-4 py-3 rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
