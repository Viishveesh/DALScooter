import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import {
  CognitoUserPool
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    userPool.signUp(email, password, [
      { Name: 'email', Value: email }
    ], null, (err, result) => {
      if (err) {
        setMessage(err.message || JSON.stringify(err));
      } else {
        setMessage('Registration successful! Check your email for verification.');
        navigate('/confirm');

        // Call API Gateway to store Q&A
        fetch(import.meta.env.VITE_STORE_QA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: result.userSub,
            question,
            answer
          })
        });
      }
    });
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            onClick={() => setShowPassword((prev) => !prev)}
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
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <select value={question} onChange={(e) => setQuestion(e.target.value)} required style={{padding: '18px 21px', borderRadius: '8px', fontSize: '1.3rem', border: '1.5px solid #cbd5e1', background: '#f1f5f9', marginBottom: '8px'}}>
          <option value="">Select a security question</option>
          <option value="What is your favorite color?">What is your favorite color?</option>
          <option value="What was your first pet's name?">What was your first pet's name?</option>
          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
          <option value="What city were you born in?">What city were you born in?</option>
        </select>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            placeholder="Security Answer"
            type={showAnswer ? "text" : "password"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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
            onClick={() => setShowAnswer((prev) => !prev)}
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
            {showAnswer ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit">Register</button>
      </form>
      <p className={`message${message.includes('successful') ? ' message-success' : message ? ' message-error' : ''}`}>{message}</p>
    </div>
  );
}
