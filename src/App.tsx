import React from "react";
import ReactDOM from "react-dom/client"; // Use createRoot from react-dom/client
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import RegistrationForm from "./components/RegistrationForm.tsx";
import DustbinInteraction from "./components/DustbinInteraction.tsx";
import Profile from "./pages/Profile.tsx";
import AdminConsole from "./components/AdminConsole.tsx";
import UserManagement from "./components/UserManagement.tsx";
import BinManagement from "./components/BinManagement.tsx";


function MainApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/dustbininteraction" element={<DustbinInteraction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/users" element={<UserManagement />} /> 
        <Route path="/bins" element={<BinManagement />} /> 
      </Routes>
    </HashRouter>
  );
}

// Use ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<MainApp />);

export default MainApp;