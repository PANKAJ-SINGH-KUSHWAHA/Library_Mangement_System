import { useEffect, useState } from "react";
import { verifyEmail } from "../api/auth";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const [status, setStatus] = useState("Verifying...");
  const nav = useNavigate();

  useEffect(() => {
    if (!code) {
      setStatus("Invalid verification link.");
      return;
    }
    let t;
    verifyEmail(code)
      .then(() => {
        setStatus("Email verified. You can login now.");
        t = setTimeout(() => nav("/login"), 2000);
      })
      .catch((err) => {
        setStatus(err.response?.data || "Verification failed");
      });

    return () => {
      if (t) clearTimeout(t);
    };
  }, [code, nav]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-lg font-semibold">Email verification</h2>
        <p className="mt-4">{status}</p>
      </div>
    </div>
  );
}
