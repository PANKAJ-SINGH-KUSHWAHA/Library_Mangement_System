import { BookOpen, Trash2, Users, CheckCircle, AlertCircle, X, Pencil, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: 3,
    password: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/user/${editingUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: { id: formData.roleId || 3 },
        });
        showNotification("Member updated successfully!", "success");
      } else {
        await api.post("/admin/users/member", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: { id: 3 },
        });
        showNotification("Member added successfully!", "success");
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roleId: 3
      });
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data || "Error saving member", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  const closeNotification = () => setNotification(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      showNotification(err.response?.data || "Error fetching users", "error");
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

  const removeMember = async (id) => {
    try {
      await api.delete(`/admin/users/member/${id}`);
      fetchUsers();
      showNotification("Member removed successfully!", "success");
    } catch (err) {
      showNotification(err.response?.data || "Error removing member", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBorrowRecords();
  }, []);

  const activeLoans = borrowRecords.filter((r) => r.status === "BORROWED").length;
  const totalMembers = users.filter((u) => u.role?.name === "MEMBER").length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      role: user.role?.name || "MEMBER",
      password: ""
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification && (
        <Notification notification={notification} closeNotification={closeNotification} />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage library members and track borrowing activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Members" value={totalMembers} color="blue" icon={Users} />
        <StatCard title="Active Loans" value={activeLoans} color="green" icon={BookOpen} />
        <StatCard title="Total Users" value={users.length} color="purple" icon={Users} />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingUser ? "Edit Member" : "Add New Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (leave blank to keep unchanged)"
              value={formData.password}
              onChange={handleChange}
              required={!editingUser}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <div className="flex gap-4 items-center">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : editingUser ? (
                  "Update Member"
                ) : (
                  "Add Member"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Registered Users
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              All registered library members and admins
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "MEMBER"
              });
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow"
          >
            + Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-3 bg-gray-50 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-full md:w-1/3"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className=" px-3 py-2 border-2 border-gray-300 rounded-lg w-full md:w-1/4 "
          >
            <option className="bg-blue-300" value="ALL">All Roles</option>
            <option className="bg-red-300" value="ADMIN">Admin</option>
            <option className="bg-orange-300" value="LIBRARIAN">Librarian</option>
            <option className="bg-green-300" value="MEMBER">Member</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
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
                  <td className="px-6 py-4 flex gap-2">
                    {u.role?.name === "MEMBER" ? (
                      <>
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => removeMember(u.id)}
                          className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-100">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */
function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

function Notification({ notification, closeNotification }) {
  return (
    <div className="fixed top-6 right-6 z-50 notification-enter">
      <div
        className={`relative w-96 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden ${
          notification.type === "success"
            ? "bg-white border-l-4 border-green-500"
            : "bg-white border-l-4 border-red-500"
        }`}
      >
        <div
          className={`absolute inset-0 opacity-5 ${
            notification.type === "success"
              ? "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"
              : "bg-gradient-to-br from-red-400 via-rose-400 to-pink-400"
          }`}
        />
        <div className="relative p-5 flex items-start gap-4">
          <div
            className={`flex-shrink-0 rounded-full p-2 ${
              notification.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-7 h-7 text-green-600" strokeWidth={2.5} />
            ) : (
              <AlertCircle className="w-7 h-7 text-red-600" strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`text-base font-bold mb-1 ${
                notification.type === "success" ? "text-green-900" : "text-red-900"
              }`}
            >
              {notification.type === "success" ? "✓ Success" : "✕ Error"}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button
            onClick={closeNotification}
            className={`flex-shrink-0 rounded-full p-1.5 transition-all duration-200 ${
              notification.type === "success"
                ? "hover:bg-green-100 text-green-600 hover:rotate-90"
                : "hover:bg-red-100 text-red-600 hover:rotate-90"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
