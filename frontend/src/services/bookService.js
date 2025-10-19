import api from './api'

export function listBooks({ q, category, page=0, size=10 } = {}) {
  return api.get('/books', { params: { q, category, page, size } }).then(r => r.data);
}
export function getBook(id) { return api.get('/books/' + id).then(r => r.data); }
export function createBook(book) { return api.post('/books', book).then(r => r.data); }
export function updateBook(id, book) { return api.put('/books/' + id, book).then(r => r.data); }
export function deleteBook(id) { return api.delete('/books/' + id).then(r => r.data); }