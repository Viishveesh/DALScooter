import React from 'react';

export default function Dashboard() {
  const email = localStorage.getItem('userEmail');

  return (
    <div>
      <h2>Welcome to DALScooter</h2>
      <p>You are logged in as: <strong>{email}</strong></p>
      <p>This dashboard can show:</p>
      <ul>
        <li>Booking details</li>
        <li>Feedback form</li>
        <li>Bike access code lookup</li>
        <li>Support chatbot</li>
      </ul>
    </div>
  );
}