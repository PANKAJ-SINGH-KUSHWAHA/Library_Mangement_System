import { BookOpen, Trash2, Users, CheckCircle, AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [notification, setNotification] = useState(null);

  // Show notification helper with auto-dismiss
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Manually close notification
  const closeNotification = () => {
    setNotification(null);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      showNotification(err.response?.data || "Error fetching users", "error");
    }
  };

  const removeMember = async (id) => {
    try {
      await api.delete(`/admin/users/member/${id}`);
      fetchUsers();
      showNotification("Member removed successfully!", "success");
    } catch (err) {
      showNotification(err.response?.data || "Error removing member", "error");
    }
  };

  const markReturn = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      showNotification("Book has been successfully marked as returned!", "success");
      await fetchBorrowRecords();
      await fetchUsers();
    } catch (err) {
      showNotification(err.response?.data || "Error marking book as returned", "error");
    }
  };

  const fetchBorrowRecords = async () => {
    try {
      const { data } = await api.get("/borrow/all");
      setBorrowRecords(data);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBorrowRecords();
  }, []);

  const activeLoans = borrowRecords.filter(r => r.status === "BORROWED").length;
  const totalMembers = users.filter(u => u.role?.name === "MEMBER").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Premium Notification System */}
      <style>{`
        @keyframes slideInBounce {
          0% {
            transform: translateX(400px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateX(-15px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .notification-enter {
          animation: slideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      
      {notification && (
        <div className="fixed top-6 right-6 z-50 notification-enter">
          <div
            className={`relative w-96 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden ${
              notification.type === 'success' 
                ? 'bg-white border-l-4 border-green-500' 
                : 'bg-white border-l-4 border-red-500'
            }`}
            style={{
              boxShadow: notification.type === 'success' 
                ? '0 20px 25px -5px rgba(34, 197, 94, 0.2), 0 10px 10px -5px rgba(34, 197, 94, 0.1)'
                : '0 20px 25px -5px rgba(239, 68, 68, 0.2), 0 10px 10px -5px rgba(239, 68, 68, 0.1)'
            }}
          >
            {/* Animated Background Gradient */}
            <div 
              className={`absolute inset-0 opacity-5 ${
                notification.type === 'success' 
                  ? 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400' 
                  : 'bg-gradient-to-br from-red-400 via-rose-400 to-pink-400'
              }`}
              style={{ animation: 'pulse 3s ease-in-out infinite' }}
            />
            
            <div className="relative p-5 flex items-start gap-4">
              {/* Icon with Animation */}
              <div className={`flex-shrink-0 rounded-full p-2 ${
                notification.type === 'success' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className="w-7 h-7 text-green-600" strokeWidth={2.5} />
                ) : (
                  <AlertCircle className="w-7 h-7 text-red-600" strokeWidth={2.5} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-base font-bold mb-1 ${
                  notification.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {notification.type === 'success' ? '✓ Success' : '✕ Error'}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeNotification}
                className={`flex-shrink-0 rounded-full p-1.5 transition-all duration-200 ${
                  notification.type === 'success' 
                    ? 'hover:bg-green-100 text-green-600 hover:rotate-90' 
                    : 'hover:bg-red-100 text-red-600 hover:rotate-90'
                }`}
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative h-1.5 bg-gray-100">
              <div
                className={`absolute inset-y-0 left-0 ${
                  notification.type === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{
                  animation: 'progressShrink 4s linear forwards',
                  boxShadow: notification.type === 'success'
                    ? '0 0 10px rgba(34, 197, 94, 0.5)'
                    : '0 0 10px rgba(239, 68, 68, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage library members and track borrowing activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-3xl font-bold text-gray-800">{totalMembers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-gray-800">{activeLoans}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Registered Users
          </h2>
          <p className="text-sm text-gray-600 mt-1">All registered library members and administrators</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role?.name === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role?.name === "MEMBER" ? (
                      <button
                        onClick={() => removeMember(u.id)}
                        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}