import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./components/Settings";
import Books from "./pages/Books";
import BorrowRecords from "./pages/BorrowRecords";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManageBookForm from "./pages/ManageBookForm";
import ManageBooks from "./pages/ManageBooks";
import MyBorrowedBooks from "./pages/MyBorrowedBooks";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Protect root dashboard route so unauthenticated users are redirected to /login */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/books" element={<Books />} />
        <Route path="/my-borrows" element={<PrivateRoute><MyBorrowedBooks /></PrivateRoute>} />
        <Route path="/manage-books" element={<PrivateRoute><ManageBooks /></PrivateRoute>} />
        <Route path="/manage-books/add" element={<PrivateRoute><ManageBookForm /></PrivateRoute>} />
        <Route path="/manage-books/edit/:id" element={<PrivateRoute><ManageBookForm /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/borrow-records" element={<PrivateRoute><BorrowRecords /></PrivateRoute>} />
      </Routes>
    </>
  );
}
