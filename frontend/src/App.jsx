import React from 'react';
import { Routes, Route } from 'react-router-dom';

// ----- screens -----
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import ConfirmAccount from './components/ConfirmAccount';
import Dashboard from './components/Dashboard';

/**
 * App‑level router.  We intentionally removed the old navigation bar and
 * heading so that the landing page (Home) renders edge‑to‑edge.
 */
export default function App() {
  return (
      <div className="app-shell">
        <Routes>
          {/* Public marketing page */}
          <Route path="/" element={<Home />} />

          {/* Auth flow */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmAccount />} />

          {/* Protected area */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
  );
}
