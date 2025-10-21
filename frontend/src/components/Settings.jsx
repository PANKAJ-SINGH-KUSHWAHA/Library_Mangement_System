import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { requestPasswordReset, confirmPasswordReset } from "../api/auth";

export default function Settings() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user)
    return <p className="text-center mt-12">Please login to access settings.</p>;

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // Trigger OTP specifically for updating password
      await requestPasswordReset(user.email);
      alert("OTP sent to your email.");
      setShowPasswordForm(true);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Error sending OTP")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmPasswordReset({
        email: user.email,
        otp,
        newPassword,
      });
      alert("Password updated successfully!");
      setOtp("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Invalid OTP or error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      {/* Update Password Section */}
      {!showPasswordForm && (
        <button
          onClick={handleSendOtp}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Update Password"}
        </button>
      )}

      {showPasswordForm && (
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 mt-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border p-2 rounded"
            required
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            type="password"
            minLength={6}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className={`w-full py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Confirm Password Change"}
          </button>
        </form>
      )}
    </div>
  );
}
