import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, deleteBook as deleteBookAPI } from "../api/books";
import { BookOpen } from "lucide-react";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBookAPI(bookId);
      alert("Book deleted successfully");
      fetchBooks();
    } catch (err) {
      alert(err.response?.data || "Error deleting book");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">📚 Manage Books</h1>
        <button
          onClick={() => navigate("/manage-books/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          ➕ Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <p className="text-gray-600">No books found. Try adding a new one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
            >
              {/* Book Image or Gradient */}
              <div className="h-48 w-full flex items-center justify-center relative overflow-hidden rounded-t-xl">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = ""; // fallback to gradient
                    }}
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>

                {/* Availability Badge */}
                {book.availableCopies > 0 ? (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Available
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h2>
                <p className="text-gray-600">👤 <strong>Author:</strong> {book.author}</p>
                <p className="text-gray-600">🏢 <strong>Publisher:</strong> {book.publisher}</p>
                <p className="text-gray-600">📦 <strong>Total Copies:</strong> {book.totalCopies}</p>
                <p className="text-gray-600">✅ <strong>Available:</strong> {book.availableCopies}</p>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate(`/manage-books/edit/${book.id}`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteBook(book.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
