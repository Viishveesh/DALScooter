import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ConfirmAccount from './components/ConfirmAccount';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>DALScooter Auth</h1>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
        <Link to="/confirm"><button>Confirm Email</button></Link>
        <Link to="/dashboard"><button>Dashboard</button></Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<ConfirmAccount />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}