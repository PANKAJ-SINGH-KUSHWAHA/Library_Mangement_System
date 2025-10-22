import { useEffect, useState } from "react";
import { getBooks } from "../api/books"; // named export for fetching
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient"; // use this for borrow requests

export default function Books() {
  const [books, setBooks] = useState([]);
  const { user } = useAuth();

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Local borrow function using apiClient
  const handleBorrow = async (bookId) => {
    if (user?.role !== "MEMBER") {
      alert("Only users can borrow books");
      return;
    }
    try {
      await api.post(`/borrow/${bookId}?email=${user.email}`);
      alert("Book borrowed successfully!");
      fetchBooks(); // refresh book list
    } catch (err) {
      alert(err.response?.data || "Error borrowing book");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Book Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold">{book.title}</h2>
            <p>Author: {book.author}</p>
            <p>Publisher: {book.publisher}</p>
            <p>Available Copies: {book.availableCopies}</p>

            {user?.role?.toUpperCase() === "MEMBER" && book.availableCopies > 0 && (
              <button
                onClick={() => handleBorrow(book.id)}
                className="bg-green-500 text-white px-3 py-1 mt-2 rounded"
              >
                Borrow
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
