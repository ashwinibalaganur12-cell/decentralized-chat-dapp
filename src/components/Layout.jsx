import React from 'react';
import './Layout.css';

const Layout = ({ children, sidebar }) => {
  return (
    <div className="layout-container">
      <aside className="sidebar glass-panel">
        {sidebar}
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
