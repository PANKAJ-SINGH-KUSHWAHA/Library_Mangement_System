import { useState } from "react";
import { requestPasswordReset } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true); // start loader
    try {
      const res = await requestPasswordReset(email);

      const message = res?.data?.message || "OTP sent to your email";
      alert(message);
      navigate("/password-reset/confirm");
    } catch (err) {
      console.error("Password reset error:", err.response?.data);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Error sending OTP";
      alert(msg);
    } finally {
      setLoading(false); // stop loader
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">Request Password Reset</h2>
        <form onSubmit={handleRequest} className="mt-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full border p-2 rounded"
            required
            disabled={loading} // disable input while loading
          />
          <button
            type="submit"
            className={`mt-3 w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading} // disable button while loading
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
