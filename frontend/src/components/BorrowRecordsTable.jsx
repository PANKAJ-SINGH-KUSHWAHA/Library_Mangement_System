// BorrowRecordsTable.jsx
import { AlertCircle, BookOpen, CheckCircle, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export function BorrowRecordsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState("");
  const [sortField, setSortField] = useState("borrowDate");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [notification, setNotification] = useState(null);

  const loanDays = 7; // Default loan period

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch borrow records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/borrow/all");
      setRecords(data);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
      showNotification("Failed to fetch borrow records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Mark as returned
  const markReturn = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      showNotification("Book marked as returned!", "success");
      fetchRecords();
    } catch (err) {
      console.error("Error marking book returned:", err);
      showNotification(err.response?.data || "Error marking book as returned", "error");
    }
  };

  // Filter and sort records
  const filteredRecords = records
    .filter(
      (r) =>
        r.userEmail.toLowerCase().includes(filterTerm.toLowerCase()) ||
        r.bookTitle.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // Dynamic borrowDate calculation if missing
      if (sortField === "borrowDate") {
        valA = valA || (a.dueDate ? new Date(new Date(a.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
        valB = valB || (b.dueDate ? new Date(new Date(b.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000) : null);
      }

      if (valA instanceof Date && valB instanceof Date) {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
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
    <div className="relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            } border-l-4 p-4 rounded-r-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md backdrop-blur-sm`}
          >
            <div
              className={`p-2 rounded-full ${
                notification.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{notification.type === "success" ? "Success" : "Error"}</h3>
              <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Search by user email or book title..."
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "User Email", field: "userEmail" },
                { label: "Book", field: "bookTitle" },
                { label: "Borrow Date", field: "borrowDate" },
                { label: "Due Date", field: "dueDate" },
                { label: "Return Date", field: "returnDate" },
                { label: "Status", field: "status" },
                { label: "Actions" },
              ].map((col) => (
                <th key={col.label} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.field && (
                      <button onClick={() => toggleSort(col.field)} className="flex flex-col ml-1">
                        <ChevronUp className={`w-3 h-3 ${sortField === col.field && sortOrder === "asc" ? "text-black" : "text-gray-300"}`} />
                        <ChevronDown className={`w-3 h-3 ${sortField === col.field && sortOrder === "desc" ? "text-black" : "text-gray-300"}`} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No borrow records found</p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-600">{record.userEmail}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {record.borrowDate
                      ? new Date(record.borrowDate).toLocaleDateString()
                      : record.dueDate
                      ? new Date(new Date(record.dueDate).getTime() - loanDays * 24 * 60 * 60 * 1000).toLocaleDateString()
                      : "-"}
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
                        record.status === "BORROWED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
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
                      <span className="text-sm text-gray-500 italic">
                        Completed on {new Date(record.returnDate).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
