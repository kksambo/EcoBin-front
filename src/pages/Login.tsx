import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // List of super user emails
  const adminEmails = [
    "kg@wastem.com",
    "mc@wastem.com",
    "tumi@wastem.com"
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://ecobin-back.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Store token and user email
      localStorage.setItem("token", data.Token);
      localStorage.setItem("userEmail", email);

      // Normalize email and check if it's an admin
      const isAdmin = adminEmails.includes(email.trim().toLowerCase());

      // Redirect based on role
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <Link className="navbar-brand" to="#">Admin Panel</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" to="#">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">Users</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">Activities</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">Settings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-danger" to="#">Logout</Link>
            </li>
          </ul>
        </div>
      </nav>

      <center>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        <div className="login-actions">
          <Link to="/" className="btn btn-secondary">
            Go Back Home
          </Link>
          <Link to="/forgot-password" className="btn btn-link">
            Forgot Password?
          </Link>
        </div>
      </center>
    </div>
  );
};

export default Login;
