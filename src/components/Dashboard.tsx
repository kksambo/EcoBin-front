import React from "react";

function  Dashboard(){
  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>
      <div className="statistics">
        <h4>Your Statistics</h4>
        <p>Total Waste Collected: 150 kg</p>
        <p>Rewards Earned: 200 points</p>
      </div>
      <div className="dustbin-status">
        <h4>Dustbin Operational Status</h4>
        <ul>
          <li>Dustbin 1: Operational</li>
          <li>Dustbin 2: Needs Maintenance</li>
          <li>Dustbin 3: Operational</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;