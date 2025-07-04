import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import './ConfirmAccount.css';
import { useNavigate } from 'react-router-dom';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export default function ConfirmAccount() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleConfirm = (e) => {
    e.preventDefault();

    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        setMessage(err.message || JSON.stringify(err));
      } else {
        setMessage('Account confirmed successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 1200);
      }
    });
  };

  return (
    <div className="auth-container">
      <h2>Confirm Your Email</h2>
      <form className="login-form" onSubmit={handleConfirm}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Confirmation Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit">Confirm</button>
      </form>
      <p className={`message${message.includes('successfully') ? ' message-success' : message ? ' message-error' : ''}`}>{message}</p>
    </div>
  );
}