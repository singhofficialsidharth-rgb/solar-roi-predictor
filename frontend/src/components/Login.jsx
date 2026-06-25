import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function Login() {
  const { login, register, authError } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle state

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword, resetPassword } = useContext(AuthContext);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isRegistering) {
      await register(name, email, password);
    } else {
      await login(email, password);
    }

    setIsSubmitting(false);
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setResetMessage(null);
    setIsSubmitting(true);

    const resp = await forgotPassword(forgotEmail);
    if (resp?.ok) {
      setResetMessage(resp.resetToken
        ? `Reset code: ${resp.resetToken} (expires in ${resp.expiresInMinutes || 'a few'} minutes)`
        : 'If that email exists, reset instructions were sent.'
      );
    } else {
      setResetMessage(resp?.message || 'Could not start reset.');
    }

    setIsSubmitting(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetMessage(null);
    setIsSubmitting(true);

    const ok = await resetPassword(resetCode, newPassword);
    if (ok) {
      setResetMessage('Password reset succeeded — you are now signed in.');
      setForgotMode(false);
    } else {
      setResetMessage('Could not reset password.');
    }

    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 20px",
        color: "#fff",
      }}
    >
      <div
        style={{
          background: "#2c2f33",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#4CAF50",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            ☀️
          </div>
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "24px",
              letterSpacing: "0.5px",
            }}
          >
            Solar<span style={{ color: "#4CAF50" }}>ROI</span>
          </h2>
        </div>

        <h3 style={{ textAlign: "center", marginTop: 0, color: "#aaa" }}>
          {isRegistering ? "Create an Account" : "Welcome Back"}
        </h3>

        {authError && (
          <div
            style={{
              background: "#ff4d4d20",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {authError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {isRegistering && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label style={{ color: "#aaa", fontSize: "14px" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  background: "#1e1e24",
                  color: "#fff",
                  fontSize: "16px",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ color: "#aaa", fontSize: "14px" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #444",
                background: "#1e1e24",
                color: "#fff",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ color: "#aaa", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #444",
                background: "#1e1e24",
                color: "#fff",
                fontSize: "16px",
              }}
            />
            {!isRegistering && (
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <span
                  onClick={() => { setForgotMode(true); setForgotEmail(email || ''); setResetMessage(null); }}
                  style={{ color: '#4CAF50', cursor: 'pointer', fontSize: 13 }}
                >
                  Forgot password?
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "#4CAF50",
              color: "#fff",
              border: "none",
              padding: "14px",
              borderRadius: "6px",
              cursor: isSubmitting ? "wait" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Sign Up"
                : "Sign In"}
          </button>
        </form>

        {forgotMode && (
          <div style={{ marginTop: 18, background: '#232428', padding: 12, borderRadius: 8 }}>
            {!resetCode && (
              <form onSubmit={handleForgotRequest} style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <label style={{ color: '#aaa', fontSize: 14 }}>Enter your email to reset password</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #444', background: '#1e1e24', color: '#fff' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#4CAF50', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none' }}>
                    {isSubmitting ? 'Sending...' : 'Send reset'}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(false); setResetMessage(null); }} style={{ padding: '8px 12px', borderRadius: 6 }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {resetMessage && (
              <div style={{ marginTop: 10, color: '#ddd', fontSize: 13 }}>{resetMessage}</div>
            )}

            {/** If resetToken was exposed in response, allow entering code+new password */}
            {resetMessage && /Reset code:/.test(resetMessage) && (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', gap: 8, flexDirection: 'column', marginTop: 10 }}>
                <label style={{ color: '#aaa', fontSize: 14 }}>Reset Code</label>
                <input value={resetCode} onChange={(e) => setResetCode(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #444', background: '#1e1e24', color: '#fff' }} />
                <label style={{ color: '#aaa', fontSize: 14 }}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #444', background: '#1e1e24', color: '#fff' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#4CAF50', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none' }}>
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(false); setResetMessage(null); }} style={{ padding: '8px 12px', borderRadius: 6 }}>
                    Close
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          {isRegistering
            ? "Already have an account? "
            : "Don't have an account? "}
          <span
            onClick={() => {
              setIsRegistering(!isRegistering);
              setEmail("");
              setPassword("");
              setName("");
            }}
            style={{ color: "#4CAF50", cursor: "pointer", fontWeight: "bold" }}
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
