import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Job List for Recruiters</h1>
      <nav>
        <Link to="/">Home</Link> | <Link to="/create">Create Job</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}
