import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import "../styles/components/AppLayout.scss"


//Styles are in App.scss

const AppLayout = ({ setIsAuthenticated }) => {
  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar setIsAuthenticated={setIsAuthenticated} />
      <main className="main-content" style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
