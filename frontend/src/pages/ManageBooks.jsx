import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, deleteBook as deleteBookAPI } from "../api/books";

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
    <div className="p-4">
      <h1 className="text-2xl mb-4">Manage Books</h1>
      <button
        onClick={() => navigate("/manage-books/add")}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Book
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold">{book.title}</h2>
            <p>Author: {book.author}</p>
            <p>Publisher: {book.publisher}</p>
            <p>Total Copies: {book.totalCopies}</p>
            <p>Available Copies: {book.availableCopies}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => navigate(`/manage-books/edit/${book.id}`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBook(book.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
