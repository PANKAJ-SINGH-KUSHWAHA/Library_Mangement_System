// src/pages/MyBorrowedBooks.jsx
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function MyBorrowedBooks() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/borrow/${user.email}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const returnBook = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      alert("Book returned successfully!");
      fetchRecords();
    } catch (err) {
      alert(err.response?.data || "Error returning book");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">My Borrowed Books</h1>
      {records.length === 0 && <p>No borrowed books.</p>}
      <ul className="space-y-2">
        {records.map((rec) => (
          <li
            key={rec.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{rec.book.title}</p>
              <p>Due Date: {new Date(rec.dueDate).toLocaleDateString()}</p>
              <p>Status: {rec.status}</p>
            </div>
            {rec.status === "BORROWED" && (
              <button
                onClick={() => returnBook(rec.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Return
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
