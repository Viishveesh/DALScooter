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
  const [showCode, setShowCode] = useState(false);
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
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            placeholder="Confirmation Code"
            type={showCode ? "text" : "password"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              paddingRight: '60px',
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '1.3rem',
              marginBottom: '18px',
              padding: '18px 21px',
              boxSizing: 'border-box',
              color: '#222',
              outline: 'none',
              fontWeight: 400
            }}
          />
          <button
            type="button"
            onClick={() => setShowCode((prev) => !prev)}
            style={{
              position: 'absolute',
              right: '18px',
              top: '7%',
              transform: 'translateY(-7%)',
              background: 'none',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontSize: '1.08rem',
              padding: 0,
              zIndex: 2,
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {showCode ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit">Confirm</button>
      </form>
      <p className={`message${message.includes('successfully') ? ' message-success' : message ? ' message-error' : ''}`}>{message}</p>
    </div>
  );
}