import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, CheckCircle, History } from "lucide-react";
import api from "../api/apiClient";

export default function BorrowRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const bookId = searchParams.get("bookId");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let endpoint = "/borrow/all";
      if (bookId) {
        endpoint = `/borrow/book/${bookId}`;
        const bookResponse = await api.get(`/books/${bookId}`);
        setBookTitle(bookResponse.data.title);
      }
      const { data } = await api.get(endpoint);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching borrow records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const markReturn = async (recordId) => {
    try {
      await api.put(`/borrow/return/${recordId}`);
      fetchRecords(); 
      alert("Book marked as returned!");
    } catch (err) {
      console.error("Error marking book returned:", err);
      alert(err.response?.data || "Error marking book as returned");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [bookId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50 p-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <History className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {bookId ? `Borrow History: ${bookTitle}` : "All Borrow Records"}
              </h1>
              <button
                onClick={() => navigate(bookId ? "/borrow-records" : "/manage-books")}
                className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors duration-200"
              >
                ← {bookId ? "All Records" : "Manage Books"}
              </button>
            </div>
          </div>
        </div>

        {/* Records Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Loan Records</h2>
                <p className="text-sm text-gray-700 mt-1 font-medium">
                  Monitor borrowing activity and returns
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 absolute top-0 left-0"></div>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User Email
                    </th>
                    {!bookId && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Book
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Borrow Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Return Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={bookId ? 6 : 7} className="px-6 py-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No borrow records found</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-600">{record.userEmail}</td>
                        {!bookId && (
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                        )}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              record.status === "BORROWED"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {record.status === "BORROWED" ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
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
                              Completed on {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "-"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
