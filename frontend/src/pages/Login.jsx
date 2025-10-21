import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordResetRequest from "./PasswordResetRequest";


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", form);
      const data = res.data;

      /*
        Normalize common API shapes:
        - { token, role }
        - { token, user: { ... } }
        - { token, roles: ["ADMIN"] }
      */
      const payload = {
        token: data.token || data.accessToken || data.authToken,
        role: data.role || (data.roles && data.roles[0]) || (data.user && (data.user.role || (data.user.roles && data.user.roles[0]))),
        user: data.user || { email: data.email, firstName: data.firstName, roles: data.roles }
      };

      // login will persist token and normalized user
      login(payload);

      // decide where to navigate after login
      const role = payload.role;
      if (role === "ADMIN") navigate("/admin");
      else if (role === "LIBRARIAN") navigate("/librarian");
      else navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Please verify your email or check credentials");
      } else {
        setError("Server error, try again later");
      }
    }
  };

   if (showReset) {
    return (
      <PasswordResetRequest
        onBack={() => setShowReset(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border rounded p-2"
          required
        />
        
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setShowReset(true)}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
