import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./AdminConsole.css"; // Ensure CSS is appropriately styled

interface Bin {
  id: number;
  binCode: string;
  location: string;
  availability: string;
  capacity: number;
  currentWeight: number;
}

function BinManagement() {
  // State hooks
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Bin | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Bin | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBin, setNewBin] = useState({
    binCode: '',
    location: '',
    availability: '',
    capacity: 2000,
    currentWeight: 0
  });

  // Refs
  const tableRef = useRef<HTMLTableElement | null>(null);

  // Fetch data inside useEffect
  useEffect(() => {
    fetch("https://ecobin-back.onrender.com/api/smartbins")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bins");
        }
        return response.json();
      })
      .then((data) => {
        setBins(data);
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
      scrollToBin(event.target.value); // Scroll to bin if ID is typed
    }
  };

  // Filter bins based on search term
  const filteredBins = bins.filter((bin) =>
    bin.id.toString().includes(searchTerm)
  );

  // Scroll to the bin when found
  const scrollToBin = (binId: string) => {
    const row = tableRef.current?.querySelector(`tr[data-id="${binId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle bin actions
  const handleView = (binId: number) => {
    const bin = bins.find((bin) => bin.id === binId);
    if (bin) {
      setSelectedUser(bin);
    }
  };

  const handleRemove = (binId: number) => {
    const bin = bins.find((bin) => bin.id === binId);
    setUserToDelete(bin || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    fetch(`https://ecobin-back.onrender.com/api/deleteBin/${userToDelete.id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete bin");
        }
        setBins((prevBins) => prevBins.filter((bin) => bin.id !== userToDelete.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error("Error:", error);
        setShowDeleteModal(false);
        setUserToDelete(null);
      });
  };

  const handleAddBinChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBin((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBin = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('https://ecobin-back.onrender.com/api/smartbins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newBin, capacity: Number(newBin.capacity), currentWeight: Number(newBin.currentWeight) })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add bin');
        return res.json();
      })
      .then((data) => {
        setBins((prev) => [...prev, data]);
        setShowAddModal(false);
        setNewBin({ binCode: '', location: '', availability: '', capacity: 2000, currentWeight: 0 });
      })
      .catch((err) => alert(err.message));
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
        <h1>Bin Management</h1>
        <p className="lead">Manage bins, view detailed Information</p>
      </div>

      {/* Search Box */}
      <div className="container mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Bin ID"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Bin Management Table */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary mb-0">Bins List</h2>
          <button className="btn btn-success" onClick={() => setShowAddModal(true)}>+ Add Bin</button>
        </div>
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "scroll" }}>
          <table ref={tableRef} className="table table-dark table-bordered">
            <thead>
              <tr>
                <th>Bin ID</th>
                <th>Bin Code</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Capacity</th>
                <th>Current Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBins.map((bin: Bin) => (
                <tr key={bin.id} data-id={bin.id}>
                  <td>{bin.id}</td>
                  <td>{bin.binCode}</td>
                  <td>{bin.location}</td>
                  <td>{bin.availability}</td>
                  <td>{bin.capacity}</td>
                  <td>{bin.currentWeight}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleView(bin.id)}>
                      View
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(bin.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Bin Modal */}
      <Modal show={!!selectedUser} onHide={() => setSelectedUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bin Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><strong>Bin ID:</strong> {selectedUser.id}</p>
              <p><strong>Bin Code:</strong> {selectedUser.binCode}</p>
              <p><strong>Location:</strong> {selectedUser.location}</p>
              <p><strong>Availability:</strong> {selectedUser.availability}</p>
              <p><strong>Capacity:</strong> {selectedUser.capacity}</p>
              <p><strong>Current Weight:</strong> {selectedUser.currentWeight}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedUser(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Bin Modal */}
      <Modal show={showDeleteModal && !!userToDelete} onHide={() => { setShowDeleteModal(false); setUserToDelete(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Bin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p>Are you sure you want to delete this bin?</p>
              <p><strong>Bin ID:</strong> {userToDelete.id}</p>
              <p><strong>Bin Code:</strong> {userToDelete.binCode}</p>
              <p><strong>Location:</strong> {userToDelete.location}</p>
              <p><strong>Availability:</strong> {userToDelete.availability}</p>
              <p><strong>Capacity:</strong> {userToDelete.capacity}</p>
              <p><strong>Current Weight:</strong> {userToDelete.currentWeight}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Bin Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Bin</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleAddBin}>
          <Modal.Body>
            <div className="mb-2">
              <label className="form-label">Bin Code</label>
              <input name="binCode" className="form-control" value={newBin.binCode} onChange={handleAddBinChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Location</label>
              <input name="location" className="form-control" value={newBin.location} onChange={handleAddBinChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Availability</label>
              <select name="availability" className="form-select" value={newBin.availability} onChange={handleAddBinChange} required>
                <option value="">Select</option>
                <option value="available">Available</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Capacity</label>
              <input name="capacity" type="number" className="form-control" value={newBin.capacity} onChange={handleAddBinChange} required min="1" />
            </div>
            <div className="mb-2">
              <label className="form-label">Current Weight</label>
              <input name="currentWeight" type="number" className="form-control" value={newBin.currentWeight} onChange={handleAddBinChange} required min="0" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Add Bin</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <footer>
        &copy; 2025 Admin Console. All rights reserved.
      </footer>
    </div>
  );
}

export default BinManagement;
