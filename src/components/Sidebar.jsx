// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "../styles/components/Sidebar.scss";
import { FaUserCircle } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { MdLogout } from "react-icons/md";
import "../styles/components/Sidebar.scss";


const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let username;
  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
       username = decodedToken.username || "User"; // Extract username (adjust the key based on your JWT structure)
      console.log(username)
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
              Dashboard
            </NavLink>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <NavLink
              to="/app/quality-input"
              style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
            >
              Quality Input
            </NavLink>
          </li>
          {/* Add more sidebar options here as needed */}
        </ul>
      </nav>
      <div className='bottom-controls'>
        <div className='username-container'>
        <FaUserCircle/>
        <p>{username}</p>

        </div>
        <button className='logout-button' onClick={handleLogout} >
        <MdLogout/>
      </button>
      </div>

    </aside>
  );
};

export default Sidebar;
