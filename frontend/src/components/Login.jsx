import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function Login() {
  const { login, register, authError } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle state

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
