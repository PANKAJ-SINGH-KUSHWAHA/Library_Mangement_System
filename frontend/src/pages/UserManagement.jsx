import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      alert(err.response?.data || "Error fetching users");
    }
  };

  const removeMember = async (id) => {
    try {
      await api.delete(`/admin/users/member/${id}`);
      fetchUsers();
      alert("Member removed!");
    } catch (err) {
      alert(err.response?.data || "Error removing member");
    }
  };

  const markReturn = async (recordId) => {
    try {
      await api.put(`/admin/users/return/${recordId}`);
      alert("Book marked as returned!");
      fetchBorrowRecords();
    } catch (err) {
      alert(err.response?.data || "Error marking book as returned");
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

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">User Management</h1>

      <h2 className="text-xl mb-2">Users</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role?.name}</td>
              <td className="border p-2">
                {u.role?.name === "MEMBER" && (
                  <button
                    onClick={() => removeMember(u.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove Member
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl mb-2">Borrowed Books</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User Email</th>
            <th className="border p-2">User Name</th>
            <th className="border p-2">Book</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {borrowRecords.map((record) => (
            <tr key={record.id}>
              <td className="border p-2">{record.userEmail}</td>
              <td className="border p-2">{record.firstName}</td>
              <td className="border p-2">{record.bookTitle}</td>
              <td className="border p-2">{record.status}</td>
              <td className="border p-2">
                {record.status === "BORROWED" && (
                  <button
                    onClick={() => markReturn(record.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Mark Returned
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
