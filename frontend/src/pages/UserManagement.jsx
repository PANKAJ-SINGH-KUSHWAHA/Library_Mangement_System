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

  // formData uses roleId numeric values: 2 = Librarian, 3 = Member
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleId: 3,
    password: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPageLib, setCurrentPageLib] = useState(1);
  const [currentPageMem, setCurrentPageMem] = useState(1);
  const itemsPerPage = 6;

  // Helper: get numeric roleId from user object (supports role.id or roleId)
  const getRoleId = (u) => {
    if (!u) return null;
    return (u.role && typeof u.role === "object" && u.role.id) ? Number(u.role.id)
      : (u.roleId ? Number(u.roleId) : (u.role && typeof u.role === "string" ? roleNameToId(u.role) : null));
  };

  const roleNameToId = (r) => {
    if (!r) return null;
    const name = String(r).toUpperCase();
    if (name === "ADMIN") return 1;
    if (name === "LIBRARIAN") return 2;
    if (name === "MEMBER") return 3;
    return null;
  };

  const roleIdToName = (id) => {
    if (id === 1) return "ADMIN";
    if (id === 2) return "LIBRARIAN";
    if (id === 3) return "MEMBER";
    return "UNKNOWN";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "roleId") setFormData({ ...formData, [name]: Number(value) });
    else setFormData({ ...formData, [name]: value });
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data || []);
    } catch (err) {
      showNotification(err.response?.data || "Error fetching users", "error");
    }
  };

  const fetchBorrowRecords = async () => {
    try {
      const { data } = await api.get("/borrow/all");
      setBorrowRecords(data || []);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBorrowRecords();
  }, []);

  const activeLoans = borrowRecords.filter((r) => r.status === "BORROWED").length;
  const totalMembers = users.filter((u) => getRoleId(u) === 3).length;

  // Combined search for both tables
  const search = searchTerm.trim().toLowerCase();
  const matchesSearch = (u) => {
    if (!search) return true;
    const fn = (u.firstName || "").toLowerCase();
    const ln = (u.lastName || "").toLowerCase();
    const em = (u.email || "").toLowerCase();
    return fn.includes(search) || ln.includes(search) || em.includes(search);
  };

  // Partition users (hide admins entirely)
  const librarians = users.filter((u) => getRoleId(u) === 2 && matchesSearch(u));
  const members = users.filter((u) => getRoleId(u) === 3 && matchesSearch(u));

  // Pagination calculations per table
  const totalPagesLib = Math.max(1, Math.ceil(librarians.length / itemsPerPage));
  const totalPagesMem = Math.max(1, Math.ceil(members.length / itemsPerPage));

  const startLib = (currentPageLib - 1) * itemsPerPage;
  const startMem = (currentPageMem - 1) * itemsPerPage;

  const currentLibrarians = librarians.slice(startLib, startLib + itemsPerPage);
  const currentMembers = members.slice(startMem, startMem + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPageLib(1);
    setCurrentPageMem(1);
  }, [searchTerm]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  const closeNotification = () => setNotification(null);

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prevent editing admin (shouldn't happen since admin hidden)
      if (editingUser && getRoleId(editingUser) === 1) {
        showNotification("Admin cannot be edited.", "error");
        return;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: { id: formData.roleId || 3 },
      };
      if (!editingUser) {
      // Creating new user — password required
      payload.password = formData.password;

      if (formData.roleId === 2) {
        await api.post("/admin/users/librarian", payload);
      } else {
        await api.post("/admin/users/member", payload);
      }

      showNotification("User created successfully!", "success");
    }
     else {
        // Updating
        if (formData.password) payload.password = formData.password;
        else payload.password = null; // or omit depending on backend; adjust if needed
        await api.put(`/admin/users/user/${editingUser.id}`, payload);
        showNotification("User updated successfully!", "success");
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({ firstName: "", lastName: "", email: "", roleId: 3, password: "" });
      await fetchUsers();
    } catch (err) {
      showNotification(err.response?.data || "Error saving user", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete member -> /admin/users/member/{id}
  const removeMember = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this member?");
    if (!ok) return;
    try {
      await api.delete(`/admin/users/member/${id}`);
      showNotification("Member removed successfully!", "success");
      await fetchUsers();
    } catch (err) {
      showNotification(err.response?.data || "Error removing member", "error");
    }
  };

  // Delete librarian -> /admin/users/librarian/{id}
  const removeLibrarian = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this librarian?");
    if (!ok) return;
    try {
      await api.delete(`/admin/users/librarian/${id}`);
      showNotification("Librarian removed successfully!", "success");
      await fetchUsers();
    } catch (err) {
      showNotification(err.response?.data || "Error removing librarian", "error");
    }
  };

  const handleEdit = (user) => {
    // double-check admins cannot be edited
    if (getRoleId(user) === 1) {
      showNotification("Admins cannot be edited.", "error");
      return;
    }
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      roleId: getRoleId(user) || 3,
      password: ""
    });
    setShowForm(true);
  };

  const openAddForm = (roleId = 3) => {
    setEditingUser(null);
    setFormData({ firstName: "", lastName: "", email: "", roleId, password: "" });
    setShowForm(true);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
      {notification && (
        <Notification notification={notification} closeNotification={closeNotification} />
      )}

      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
            User Management
          </h1>
          <p className="text-gray-600 text-lg">Manage library librarians and members</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Members" value={totalMembers} color="blue" icon={Users} />
        <StatCard title="Active Loans" value={activeLoans} color="green" icon={BookOpen} />
        <StatCard title="Total Users" value={users.length} color="purple" icon={Users} />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 relative z-10">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value={2}>Librarian</option>
                <option value={3}>Member</option>
              </select>

              <input
                type="password"
                name="password"
                placeholder={editingUser ? "Password (leave blank to keep unchanged)" : "Password"}
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-4 items-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Add User"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls: search + create quick buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => openAddForm(3)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            + Add Member
          </button>
        </div>

        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Two tables side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Librarians Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                Librarians
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manage librarian accounts</p>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-orange-200">
              <span className="text-sm font-semibold text-orange-700">Total: {librarians.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentLibrarians.map((u) => (
                  <tr key={u.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md shadow-yellow-500/30 transition-all transform hover:scale-105"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => removeLibrarian(u.id)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md shadow-red-500/30 transition-all transform hover:scale-105"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {currentLibrarians.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No librarians found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPagesLib > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setCurrentPageLib((p) => Math.max(p - 1, 1))}
                disabled={currentPageLib === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Prev
              </button>
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-bold">
                Page {currentPageLib} of {totalPagesLib}
              </span>
              <button
                onClick={() => setCurrentPageLib((p) => Math.min(p + 1, totalPagesLib))}
                disabled={currentPageLib === totalPagesLib}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                Members
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manage member accounts and borrowing</p>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-200">
              <span className="text-sm font-semibold text-blue-700">Total: {members.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentMembers.map((u) => (
                  <tr key={u.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md shadow-yellow-500/30 transition-all transform hover:scale-105"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => removeMember(u.id)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md shadow-red-500/30 transition-all transform hover:scale-105"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {currentMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No members found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPagesMem > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setCurrentPageMem((p) => Math.max(p - 1, 1))}
                disabled={currentPageMem === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Prev
              </button>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                Page {currentPageMem} of {totalPagesMem}
              </span>
              <button
                onClick={() => setCurrentPageMem((p) => Math.min(p + 1, totalPagesMem))}
                disabled={currentPageMem === totalPagesMem}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */
function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    green: "from-green-500 to-emerald-600 shadow-green-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
  };
  const bgColors = {
    blue: "from-blue-50 to-blue-100",
    green: "from-green-50 to-emerald-100",
    purple: "from-purple-50 to-purple-100",
  };
  return (
    <div className={`bg-gradient-to-br ${bgColors[color]} rounded-2xl shadow-lg p-6 border border-gray-200/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

function Notification({ notification, closeNotification }) {
  return (
    <div className="fixed top-6 right-6 z-50 notification-enter animate-slide-in">
      <div
        className={`relative w-96 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden border-2 ${
          notification.type === "success"
            ? "bg-white/95 border-green-400"
            : "bg-white/95 border-red-400"
        }`}
      >
        <div
          className={`absolute inset-0 opacity-10 ${
            notification.type === "success"
              ? "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"
              : "bg-gradient-to-br from-red-400 via-rose-400 to-pink-400"
          }`}
        />
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            notification.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-red-500 to-rose-500"
          }`}
        />
        <div className="relative p-6 flex items-start gap-4">
          <div
            className={`flex-shrink-0 rounded-xl p-2.5 shadow-lg ${
              notification.type === "success" 
                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                : "bg-gradient-to-br from-red-500 to-rose-600"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
            ) : (
              <AlertCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`text-lg font-bold mb-1 ${
                notification.type === "success" ? "text-green-900" : "text-red-900"
              }`}
            >
              {notification.type === "success" ? "Success" : "Error"}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {notification.message}
            </p>
          </div>
          <button
            onClick={closeNotification}
            className={`flex-shrink-0 rounded-full p-2 transition-all duration-300 transform hover:rotate-90 ${
              notification.type === "success"
                ? "hover:bg-green-100 text-green-700"
                : "hover:bg-red-100 text-red-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}