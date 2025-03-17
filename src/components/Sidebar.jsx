// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "../styles/components/Sidebar.scss";
import { FaUserCircle } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { MdLogout } from "react-icons/md";
import "../styles/components/Sidebar.scss";

import { LuLayoutDashboard as DashboardIcon} from "react-icons/lu";
import { FaMagnifyingGlass as InspectionIcon} from "react-icons/fa6";
import { TbReportSearch as QualityReportsIcon} from "react-icons/tb";
import { LiaTruckLoadingSolid as OrdersIcon} from "react-icons/lia";







const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

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
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className='sidebar-logo-container'>
        QualiTrack
      </div>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <NavLink
              to="/app/dashboard"
              style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
            >
              <DashboardIcon/>
              Dashboard
            </NavLink>
          </li>
          
          <li style={{ marginBottom: '10px' }}>
          <NavLink
              to="/app/inspection"
              style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
            >
              <InspectionIcon/>
              Inspection
            </NavLink>
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            <NavLink
              to="/app/quality-reports"
              style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
            >
              <QualityReportsIcon/>
              Quality Reports
            </NavLink>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <NavLink
              to="/app/auswertungen"
              style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
            >
              <OrdersIcon/>
              Orders
            </NavLink>
          </li>
        

          {/* Add more sidebar options here as needed */}
        </ul>
      </nav>
      <div className='bottom-controls'>
        <NavLink to="/app/profile" className='username-container'>
        <FaUserCircle/>
        <p>{username}</p>

        </NavLink>
        <button className='logout-button' onClick={handleLogout} >
        <MdLogout/>
      </button>
      </div>

    </aside>
  );
};

export default Sidebar;
