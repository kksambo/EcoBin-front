import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Profile.css";

const adminEmails = ["kg@wastem.com", "mc@wastem.com", "tumi@wastem.com"];

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        setError("User not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://ecobin-back.onrender.com/api/AppUsers");
        if (!response.ok) throw new Error("Failed to fetch user details.");

        const users = await response.json();
        const loggedInUser = users.find((u: any) => u.email === userEmail);
        if (!loggedInUser) throw new Error("User not found.");
        setUser(loggedInUser);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  if (loading) return <p className="loading">Loading your profile...</p>;
  if (error) return <p className="error">{error}</p>;

  const isAdmin = adminEmails.includes(user?.email);

  return (
    <div className="main-container">
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <Link className="navbar-brand" to="/">SmartBin</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            {!isAdmin && <li className="nav-item"><Link className="nav-link" to="/dustbininteraction">Dispose</Link></li>}
            <li className="nav-item">
              <span className="nav-link text-danger" style={{ cursor: "pointer" }} onClick={handleLogout}>
                Logout
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">
            {isAdmin ? "👑 Admin Dashboard" : `Hi, ${user?.name}! 👋`}
          </h2>
          <p className="sub-title">
            {isAdmin
              ? "Welcome, Administrator. Here are your tools:"
              : "Here’s your profile summary:"}
          </p>

          <div className="profile-grid">
            <div className="info-box">
              <span>📧</span>
              <p><strong>Email</strong><br />{user.email}</p>
            </div>
            <div className="info-box">
              <span>📞</span>
              <p><strong>Phone</strong><br />{user.phoneNumber}</p>
            </div>

            {!isAdmin && (
              <div className="info-box">
                <span>🌟</span>
                <p><strong>Points</strong><br /><span className="badge">{user.points}</span></p>
              </div>
            )}

            {/* Admin-specific feature cards */}
            {isAdmin && (
              <>
                <div
                  className="info-box admin-box clickable"
                  onClick={() => navigate("/users")}
                >
                  <span>👥</span>
                  <p><strong>Manage Users</strong><br />View and control user accounts</p>
                </div>

                <div
                  className="info-box admin-box clickable"
                  onClick={() => navigate("/admin")}
                >
                  <span>📊</span>
                  <p><strong>Analytics</strong><br />Waste trends and bin usage</p>
                </div>

                <div
                  className="info-box admin-box clickable"
                  onClick={() => navigate("/bins")}
                >
                  <span>🗑️</span>
                  <p><strong>Bin Status</strong><br />Check bin levels in real-time</p>
                </div>
              </>
            )}
          </div>

          {!isAdmin && (
            <>
              <p className="encouragement">You're doing great! Keep disposing responsibly! ♻️</p>
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => navigate("/dustbininteraction")}>
                  Deposit Waste
                </button>
                <Link to="/" className="btn btn-secondary ml-2">
                  Go Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
