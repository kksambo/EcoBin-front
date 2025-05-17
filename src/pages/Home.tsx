import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="home-container">
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <Link className="navbar-brand" to="/">♻️ SmartBin</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dustbininteraction">Dispose</Link>
            </li>
            <li className="nav-item">
              <span className="nav-link text-danger" style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout</span>
            </li>
          </ul>
        </div>
      </nav>

      <div className="home-header">
        <h1>🌱 Welcome to SmartBin</h1>
        <p className="lead">
          Smart Waste Management at Your Fingertips.
        </p>
      </div>

      <section className="home-features">
        <h2>🚀 What You Can Do</h2>
        <ul>
          <li>👤 Register and manage your account</li>
          <li>🗑️ Dispose of waste using smart bins</li>
          <li>📡 Track your bin usage and points</li>
          <li>🎁 Earn rewards for proper disposal</li>
        </ul>
      </section>

      <div className="home-actions">
        <h2>Ready to Go?</h2>
        <Link to="/register" className="btn btn-primary mx-2">
          Register
        </Link>
        <Link to="/login" className="btn btn-secondary mx-2">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
