import api from "./apiClient";

// Fetch all books with optional query params
export const getBooks = (params = {}) => api.get("/books", { params }).then(r => r.data);

// Fetch a single book by ID
export const getBook = (id) => api.get(`/books/${id}`).then(r => r.data);

// Add a new book (admin/librarian)
export const addBook = (payload) => api.post("/books/add", payload).then(r => r.data);

// Update a book by ID (admin/librarian)
export const updateBook = (id, payload) => api.put(`/books/update/${id}`, payload).then(r => r.data);

// Delete a book by ID (admin/librarian)
export const deleteBook = (id) => api.delete(`/books/delete/${id}`).then(r => r.data);
