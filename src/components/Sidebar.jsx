// src/components/Sidebar.jsx
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUserCircle, FaRegGem } from "react-icons/fa";
import {} from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { MdLogout } from "react-icons/md";
import "../styles/components/Sidebar.scss";

import { LuLayoutDashboard as DashboardIcon } from "react-icons/lu";
import { FaMagnifyingGlass as InspectionIcon } from "react-icons/fa6";
import { TbReportSearch as QualityReportsIcon } from "react-icons/tb";
import { TbTags as ItemsIcon } from "react-icons/tb";
import { PiEyedropperSampleFill as StichprobenIcon } from "react-icons/pi";

import { LiaTruckLoadingSolid as OrdersIcon } from "react-icons/lia";
import { AiOutlineGold as GoldIcon } from "react-icons/ai";

import AuthContext from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const token = localStorage.getItem("token");
  let username;
  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
      username = decodedToken.username || "User"; // Extract username (adjust the key based on your JWT structure)
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">QualiTrack</div>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/dashboard"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <DashboardIcon />
              <p>Dashboard</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/inspection"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <InspectionIcon />
              <p>Inspection</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/gold-tests"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <GoldIcon />
              <p>Gold Tests</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/diamond-screening"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <FaRegGem />
              <p>Diamond Screening</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/quality-reports"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <QualityReportsIcon />
             <p> Quality Reports</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/items"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <ItemsIcon />
              <p>Items</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/stichproben"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <StichprobenIcon />
              <p>Prüfprotokoll</p>
            </NavLink>
          </li>

          <li style={{ marginBottom: "10px" }}>
            <NavLink
              to="/app/auswertungen"
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <OrdersIcon />
              <p>Orders</p>
            </NavLink>
          </li>

          {/* Add more sidebar options here as needed */}
        </ul>
      </nav>
      <div className="bottom-controls">
        <NavLink to="/app/profile" className="username-container">
          <FaUserCircle />
          <p>{username}</p>
        </NavLink>
        <button className="logout-button" onClick={handleLogout}>
          <MdLogout />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
