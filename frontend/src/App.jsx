import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import ManageBooks from "./pages/ManageBooks";
import VerifyEmail from "./pages/VerifyEmail";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />

        <Route path="/books" element={<Books />} />
        <Route path="/manage-books" element={<PrivateRoute><ManageBooks /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </>
  );
}
