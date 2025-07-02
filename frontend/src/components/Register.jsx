import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select value={question} onChange={(e) => setQuestion(e.target.value)} required>
          <option value="">Select a security question</option>
          <option value="What is your favorite color?">What is your favorite color?</option>
          <option value="What was your first pet's name?">What was your first pet's name?</option>
          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
          <option value="What city were you born in?">What city were you born in?</option>
        </select>
        <input placeholder="Security Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
