import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function BorrowRecords() {
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    const { data } = await api.get("/borrow/all"); // create a backend endpoint to get all borrowed records
    setRecords(data);
  };

  const markReturn = async (id) => {
    try {
      await api.put(`/borrow/return/${id}`);
      fetchRecords();
      alert("Book marked as returned");
    } catch (err) {
      alert(err.response?.data || "Error returning book");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Borrow Records</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Book</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.user.email}</td>
              <td className="border p-2">{r.book.title}</td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">
                {r.status === "BORROWED" && (
                  <button onClick={() => markReturn(r.id)} className="bg-green-500 text-white px-2 py-1 rounded">
                    Mark as Returned
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
