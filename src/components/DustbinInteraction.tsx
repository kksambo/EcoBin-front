import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  ProgressBar,
  Spinner,
  Alert,
  Navbar,
  Nav,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import binOpeningGif from "./binGif.gif";
import "./DustbinInteraction.css";

const DustbinInteraction = () => {
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [binOpen, setBinOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [showBinModal, setShowBinModal] = useState(false);
  const [bins, setBins] = useState<any[]>([]);
  const [binSearch, setBinSearch] = useState("");
  const [selectedBin, setSelectedBin] = useState<any | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (itemImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(itemImage);
    } else {
      setPreview(null);
    }
  }, [itemImage]);

  useEffect(() => {
    if (showBinModal) {
      fetch("https://ecobin-back.onrender.com/api/smartbins")
        .then((res) => res.json())
        .then((data) => setBins(data))
        .catch(() => setBins([]));
    }
  }, [showBinModal]);

  const filteredBins = bins.filter((bin) =>
    bin.location.toLowerCase().includes(binSearch.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemImage(e.target.files[0]);
    }
  };

  const handleScan = () => {
    if (!itemImage) {
      alert("Please select an image of the item.");
      return;
    }
    setShowBinModal(true);
  };

  const handleBinSelect = (bin: any) => {
    if (bin.currentWeight >= bin.capacity) {
      setError("Selected bin is full. Please choose another bin.");
      return;
    }
    setSelectedBin(bin);
    setShowBinModal(false);
    processDeposit(bin);
  };

  const processDeposit = async (bin: any) => {
    setLoading(true);
    setError(null);
    setClassificationResult(null);
    setRewardMessage(null);

    const formData = new FormData();
    formData.append("file", itemImage!);

    try {
      const response = await fetch("https://geminiapp-dp6r.onrender.com/classify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to classify the item.");

      const result = await response.json();

      if (result.classification !== "Unknown") {
        const depositRes = await fetch("https://ecobin-back.onrender.com/api/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 0,
            binId: bin.id,
            weight: 100,
            requestDate: new Date().toISOString(),
            isApproved: true
          })
        });

        if (!depositRes.ok) throw new Error("Failed to deposit item to bin.");

        setBinOpen(true);
        setTimeout(() => setBinOpen(false), 4000);
        setClassificationResult(`✅ Accepted: ${result.classification}`);
        await rewardUser();
      } else {
        setClassificationResult("❌ Rejected: Unknown item.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setItemImage(null);
    }
  };

  const rewardUser = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) throw new Error("User not logged in.");

      const response = await fetch("https://ecobin-back.onrender.com/api/givePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: userEmail, Points: 10 }),
      });

      if (!response.ok) throw new Error("Reward failed.");

      setRewardMessage("🎉 You earned 10 points!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="home-container">
      <Navbar bg="dark" expand="lg" variant="dark" className="px-4 mb-4">
        <Navbar.Brand as={Link} to="/">Smart Waste</Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            <Nav.Link as={Link} to="/dustbininteraction">Dispose</Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-danger">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container>
        <Row className="mb-4">
          <Col md={12} className="text-center">
            <h2>🗑️ Deposit Your Item</h2>
            <p>Snap a picture of your item, classify it, and earn points!</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="bg-dark text-light p-3">
              <Form.Group>
                <Form.Label>Upload or take a picture:</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>

              {preview && (
                <div className="text-center mt-3">
                  <img src={preview} alt="preview" style={{ maxWidth: "100%", height: "200px", objectFit: "contain" }} />
                </div>
              )}

              <Button
                className="mt-3"
                variant="primary"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Deposit Item"}
              </Button>
            </Card>
          </Col>
        </Row>

        {binOpen && (
          <Row className="text-center mt-4">
            <Col>
              <img src={binOpeningGif} alt="Bin Opening" height={150} />
              <p>Bin is opening...</p>
            </Col>
          </Row>
        )}

        {classificationResult && (
          <Row className="mt-3">
            <Col>
              <Alert variant="info">{classificationResult}</Alert>
            </Col>
          </Row>
        )}

        {rewardMessage && (
          <Row className="mt-2">
            <Col>
              <Alert variant="success">{rewardMessage}</Alert>
            </Col>
          </Row>
        )}

        {error && (
          <Row className="mt-2">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}
      </Container>

      <Modal
        show={showBinModal}
        onHide={() => setShowBinModal(false)}
        centered
        backdrop="static"
        enforceFocus={false}
        restoreFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select a Bin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search by location..."
            value={binSearch}
            onChange={(e) => setBinSearch(e.target.value)}
            className="mb-3"
          />
          {filteredBins.length === 0 && <div>No bins found.</div>}
          {filteredBins.map((bin) => {
            const percent = (bin.currentWeight / bin.capacity) * 100;
            return (
              <Card key={bin.id} className="mb-2">
                <Card.Body>
                  <strong style={{ color: '#fff' }}>{bin.location}</strong>
                  <ProgressBar
                    striped
                    variant={percent >= 100 ? "danger" : percent >= 50 ? "warning" : "success"}
                    now={percent}
                    label={`${Math.round(percent)}%`}
                    className="mt-2 mb-2"
                  />
                  <Button
                    variant="primary"
                    disabled={percent >= 100}
                    onClick={() => handleBinSelect(bin)}
                  >
                    Select
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DustbinInteraction;
