// BorrowRecordsTable.jsx
import { AlertCircle, BookOpen, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export function BorrowRecordsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const { data } = await api.get("/borrow/all");
      setRecords(data);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
      alert("Failed to fetch borrow records. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const markReturn = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      alert("Book marked as returned!");
      fetchRecords(); // Refresh the table
    } catch (err) {
      console.error("Error marking book returned:", err);
      alert(err.response?.data || "Error marking book as returned");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Borrow Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Return Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No borrow records found</p>
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-600">{record.userEmail}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {(() => {
                    const loanDays = 7;
                    if (record.borrowDate) return new Date(record.borrowDate).toLocaleDateString();
                    if (record.dueDate) return new Date(new Date(record.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000).toLocaleDateString();
                    return "-";
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      record.status === "BORROWED" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {record.status === "BORROWED" ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {record.status === "BORROWED" ? (
                    <button
                      onClick={() => markReturn(record.id)}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Returned
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Completed on {new Date(record.returnDate).toLocaleDateString()}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
