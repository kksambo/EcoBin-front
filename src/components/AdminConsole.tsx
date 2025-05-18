import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Nav } from "react-bootstrap";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Bar, Pie, Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminConsole() {
  const [binData, setBinData] = useState<any[]>([]);
  const [depositData, setDepositData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ecobin-back.onrender.com/api/smartbins")
      .then((res) => res.json())
      .then((data) => {
        setBinData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("https://ecobin-back.onrender.com/api/deposit")
      .then((res) => res.json())
      .then((data) => setDepositData(data))
      .catch(() => setDepositData([]));
  }, []);

  // Prepare data for the Bar chart from API
  const binCapacityData = {
    labels: binData.map((bin) => `Bin ${bin.binCode.toUpperCase()}`),
    datasets: [
      {
        label: "Capacity (%)",
        data: binData.map((bin) =>
          bin.capacity > 0 ? Math.round((bin.currentWeight / bin.capacity) * 100) : 0
        ),
        backgroundColor: "#00bcd4",
      },
    ],
  };

  // Update binUsabilityData to show points per bin (capacity % * 10)
  const binUsabilityData = {
    labels: binData.map((bin) => `Bin ${bin.binCode.toUpperCase()}`),
    datasets: [
      {
        label: "Points per Bin",
        data: binData.map((bin) => {
          const percent = bin.capacity > 0 ? Math.round((bin.currentWeight / bin.capacity) * 100) : 0;
          return percent * 10;
        }),
        backgroundColor: ["#00bcd4", "#4caf50", "#ff9800", "#e91e63", "#9c27b0", "#3f51b5", "#ffc107", "#009688"].slice(0, binData.length),
      },
    ],
  };

  // Prepare data for the Line chart from deposit API, grouped per hour, last 6 hours only
  const userPointsWeekly = React.useMemo(() => {
    if (!depositData.length) return { labels: [], datasets: [] };
    // Get current time and 6 hours ago
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    // Group by hour
    const grouped: { [hour: string]: number } = {};
    depositData.forEach((d) => {
      const date = new Date(d.requestDate);
      if (date >= sixHoursAgo && date <= now) {
        // Format: YYYY-MM-DD HH:00
        const hourKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:00`;
        grouped[hourKey] = (grouped[hourKey] || 0) + d.weight;
      }
    });
    // Fill missing hours with zero
    const labels: string[] = [];
    const data: number[] = [];
    let current = new Date(sixHoursAgo);
    current.setMinutes(0, 0, 0);
    now.setMinutes(0, 0, 0);
    while (current <= now) {
      const hourKey = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')} ${String(current.getHours()).padStart(2,'0')}:00`;
      labels.push(hourKey);
      data.push(grouped[hourKey] || 0);
      current.setHours(current.getHours() + 1);
    }
    return {
      labels,
      datasets: [
        {
          label: "Weight (kg) per hour",
          data,
          fill: true,
          backgroundColor: "rgba(0, 188, 212, 0.2)",
          borderColor: "#00bcd4",
          tension: 0.3,
        },
      ],
    };
  }, [depositData]);

  return (
    <div className="home-container">
      {/* Responsive Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 mb-4">
        <a className="navbar-brand" href="#">Admin Panel</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users">Users</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bins">Bins</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-danger" to="/logout">Logout</Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="home-header text-center">
        <h1>Admin Console</h1>
        <p className="lead">Monitor bins, manage users, and track engagement</p>
      </div>

      <Container fluid className="mb-4">
        <Row>
          <Col md={6} className="mb-4">
            <Card className="bg-dark text-light">
              <Card.Body>
                <Card.Title>Dustbin Capacity Levels</Card.Title>
                <div className="chart-container">
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    <Bar data={binCapacityData} options={{ maintainAspectRatio: false }} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="bg-dark text-light">
              <Card.Body>
                <Card.Title>Current Points Per Bin</Card.Title>
                <div className="chart-container">
                  <Pie data={binUsabilityData} options={{ maintainAspectRatio: false }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="bg-dark text-light">
              <Card.Body>
                <Card.Title>Recent Hourly Deposits</Card.Title>
                <div className="chart-container">
                  <Line data={userPointsWeekly} options={{ maintainAspectRatio: false }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminConsole;
