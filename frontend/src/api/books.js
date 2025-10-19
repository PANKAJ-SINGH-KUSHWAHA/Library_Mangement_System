import api from "./apiClient";

export const getBooks = (params = {}) => api.get("/books", { params }).then(r => r.data);
export const getBook = (id) => api.get(`/books/${id}`).then(r => r.data);
export const addBook = (payload) => api.post("/books/add", payload).then(r => r.data);
export const updateBook = (id, payload) => api.put(`/books/update/${id}`, payload).then(r => r.data);
export const deleteBook = (id) => api.delete(`/books/delete/${id}`).then(r => r.data);
