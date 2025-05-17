import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./AdminConsole.css"; // Ensure CSS is appropriately styled

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  points: number;
  amount: number;
}

function UserManagement() {
  // State hooks
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Refs
  const tableRef = useRef<HTMLTableElement | null>(null);

  // Fetch data inside useEffect
  useEffect(() => {
    fetch("https://ecobin-back.onrender.com/api/AppUsers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // Empty dependency array to run only once on mount

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value) {
      scrollToUser(event.target.value); // Scroll to user if ID is typed
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.id.toString().includes(searchTerm)
  );

  // Scroll to the user when found
  const scrollToUser = (userId: string) => {
    const row = tableRef.current?.querySelector(`tr[data-id="${userId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle user actions
  const handleView = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleRemove = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    setUserToDelete(user || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    fetch(`https://ecobin-back.onrender.com/api/deleteUser/${userToDelete.id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error("Error:", error);
        setShowDeleteModal(false);
        setUserToDelete(null);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="containers">
      <nav className="navbar navbar-expand-lg navbar-dark px-4">
        <Link className="navbar-brand" to="#">Admin Panel</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bins">Bins</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin">Admin Console</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-danger" to="/logout">Logout</Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="text-center home-header mb-4">
        <h1>User Management</h1>
        <p className="lead">Manage users, view detailed Information</p>
      </div>

      {/* Search Box */}
      <div className="container mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by User ID"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* User Management Table */}
      <div className="container my-5">
        <h2 className="text-center text-primary mb-4">Users List</h2>
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "scroll" }}>
          <table ref={tableRef} className="table table-dark table-bordered">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: User) => (
                <tr key={user.id} data-id={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleView(user.id)}>
                      View
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(user.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      <Modal show={!!selectedUser} onHide={() => setSelectedUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><strong>User ID:</strong> {selectedUser.id}</p>
              <p><strong>Username:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Points:</strong> {selectedUser.points}</p>
              <p><strong>Amount:</strong> {selectedUser.amount}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedUser(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal && !!userToDelete} onHide={() => { setShowDeleteModal(false); setUserToDelete(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p>Are you sure you want to delete this user?</p>
              <p><strong>User ID:</strong> {userToDelete.id}</p>
              <p><strong>Username:</strong> {userToDelete.name}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
              <p><strong>Phone Number:</strong> {userToDelete.phoneNumber}</p>
              <p><strong>Role:</strong> {userToDelete.role}</p>
              <p><strong>Points:</strong> {userToDelete.points}</p>
              <p><strong>Amount:</strong> {userToDelete.amount}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <footer>
        &copy; 2025 Admin Console. All rights reserved.
      </footer>
    </div>
  );
}

export default UserManagement;
