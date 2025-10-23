import { AlertCircle, BookOpen, CheckCircle, CheckCircle2, Edit, History, Package, Plus, Search, Trash2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBook as deleteBookAPI, getBooks } from "../api/books";
import { BorrowRecordsTable } from "../components/BorrowRecordsTable";

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, bookId: null, bookTitle: '' });
  const navigate = useNavigate();

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ 
      message, 
      type,
      id: Date.now()  // Add unique ID for animation purposes
    });
    // Auto-dismiss after 5 seconds for success messages only
    if (type === 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (bookId, bookTitle) => {
    setDeleteDialog({ show: true, bookId, bookTitle });
  };

  const confirmDelete = async () => {
    try {
      await deleteBookAPI(deleteDialog.bookId);
      showNotification("Book has been successfully deleted!", "success");
      fetchBooks();
      setDeleteDialog({ show: false, bookId: null, bookTitle: '' });
    } catch (err) {
      showNotification(err.response?.data || "Failed to delete book", "error");
    }
  };

  const viewBorrowRecords = (bookId, bookTitle) => {
    // Navigate to borrow records filtered by book
    navigate(`/borrow-records?bookId=${bookId}`);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
                         (filterStatus === "available" && book.availableCopies > 0) ||
                         (filterStatus === "unavailable" && book.availableCopies === 0);
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const borrowedCopies = books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteDialog({ show: false, bookId: null, bookTitle: '' })}></div>

            <div className="relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
              <div className="bg-white p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">
                      Delete Book
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deleteDialog.bookTitle}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                <button
                  onClick={confirmDelete}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition duration-150 ease-in-out"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Book
                </button>
                <button
                  onClick={() => setDeleteDialog({ show: false, bookId: null, bookTitle: '' })}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 transition duration-150 ease-in-out"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            } border-l-4 p-4 rounded-r-lg shadow-lg flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm`}
          >
            <div className={`p-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className={`w-5 h-5 ${
                  notification.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`} />
              ) : (
                <AlertCircle className={`w-5 h-5 ${
                  notification.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {notification.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className={`p-1 rounded-full hover:bg-opacity-80 ${
                notification.type === 'success' ? 'hover:bg-green-100' : 'hover:bg-red-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Library Inventory</h1>
                  <p className="text-gray-600 mt-1">Manage your book collection and track availability</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/manage-books/add")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add New Book
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Books</p>
                  <p className="text-3xl font-bold text-gray-900">{totalBooks}</p>
                  <p className="text-xs text-gray-500 mt-1">In collection</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-green-600">{availableBooks}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to borrow</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Copies</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCopies}</p>
                  <p className="text-xs text-gray-500 mt-1">All inventory</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">On Loan</p>
                  <p className="text-3xl font-bold text-orange-600">{borrowedCopies}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently borrowed</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg">
                  <History className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === "all"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Books
                </button>
                <button
                  onClick={() => setFilterStatus("available")}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === "available"
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setFilterStatus("unavailable")}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === "unavailable"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Out of Stock
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-16 text-center border border-gray-200">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No books found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first book to the library"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => navigate("/manage-books/add")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              >
                {/* Book Image */}
                <div className="h-64 w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "";
                      }}
                    />
                  ) : (
                    <div className="h-64 w-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white opacity-40" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    {book.availableCopies > 0 ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm">
                        <XCircle className="w-3.5 h-3.5" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                    {book.title}
                  </h2>
                  
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 font-semibold min-w-[85px]">Author:</span>
                      <span className="text-gray-800 font-medium">{book.author}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 font-semibold min-w-[85px]">Publisher:</span>
                      <span className="text-gray-800 font-medium">{book.publisher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm pt-3 border-t border-gray-200">
                      <span className="text-gray-500 font-semibold">Copies:</span>
                      <span className="font-bold text-gray-900">
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">available</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/manage-books/edit/${book.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBook(book.id, book.title)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => viewBorrowRecords(book.id, book.title)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold border-2 border-gray-200 hover:border-gray-300 transform hover:scale-105"
                    >
                      <History className="w-4 h-4" />
                      View Borrow History
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Borrow Records Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Borrow History</h2>
                <p className="text-sm text-gray-700 mt-1 font-medium">
                  Track all borrowing and return activity across books
                </p>
              </div>
            </div>
          </div>

          {/* Borrow Records Table */}
          <BorrowRecordsTable />
        </div>
      </div>
    </div>
  );
}