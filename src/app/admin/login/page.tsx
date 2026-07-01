"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Access denied.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060A12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#0C1220",
        border: "1px solid #162035",
        borderRadius: "16px",
        padding: "40px 32px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #00D4FF22, #00D4FF11)",
            border: "1px solid #00D4FF33",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Shield size={28} color="#00D4FF" />
          </div>
          <h1 style={{ color: "#EEF2FF", fontSize: "22px", fontWeight: 700, margin: 0 }}>
            DEELAI Admin
          </h1>
          <p style={{ color: "#7D8BAA", fontSize: "14px", marginTop: "6px" }}>
            Enter your admin email to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email field */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#7D8BAA", fontSize: "12px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                color="#4A5470"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  background: "#101829",
                  border: "1px solid #162035",
                  borderRadius: "8px",
                  padding: "11px 12px 11px 36px",
                  color: "#EEF2FF",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00D4FF55")}
                onBlur={(e)  => (e.target.style.borderColor = "#162035")}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "8px",
              background: "#FF4D6D11", border: "1px solid #FF4D6D33",
              borderRadius: "8px", padding: "10px 12px", marginBottom: "16px",
            }}>
              <AlertCircle size={15} color="#FF4D6D" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span style={{ color: "#FF4D6D", fontSize: "13px", lineHeight: "1.4" }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: "100%",
              background: loading || !email ? "#162035" : "linear-gradient(135deg, #00D4FF, #0099BB)",
              color: loading || !email ? "#4A5470" : "#060A12",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading || !email ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Verifying...
              </>
            ) : (
              "Access Admin Panel"
            )}
          </button>
        </form>

        <p style={{
          textAlign: "center", color: "#4A5470", fontSize: "12px",
          marginTop: "24px", lineHeight: "1.5",
        }}>
          Only authorised administrators can access this panel.
          <br />
          <a href="/" style={{ color: "#00D4FF", textDecoration: "none" }}>
            ← Back to DEELAI
          </a>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
