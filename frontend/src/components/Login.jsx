import React, { useState } from 'react';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const cognitoClient = new CognitoIdentityProviderClient({ region: import.meta.env.VITE_AWS_REGION });

const poolData = {
  ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
};

console.log('Cognito ClientId:', import.meta.env.VITE_COGNITO_USER_POOL_CLIENT);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [session, setSession] = useState(null);
  const [challengeParam, setChallengeParam] = useState({});
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    initiateUserPasswordAuth();
  };
// additional line to check commit problem
  const initiateUserPasswordAuth = async () => {
    try {
      const authCommand = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: poolData.ClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      const response = await cognitoClient.send(authCommand);
      console.log('Initial USER_PASSWORD_AUTH response:', response);

      // Now start custom auth
      await initiateCustomAuth();
    } catch (err) {
      console.error('Initial auth failed:', err);
      setMessage(err.message || 'Login failed.');
    }
  };

  const initiateCustomAuth = async () => {
    try {
      const customAuthCommand = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: poolData.ClientId,
        AuthParameters: {
          USERNAME: email,
        }
      });

      const response = await cognitoClient.send(customAuthCommand);
      console.log('CUSTOM_AUTH initiated:', response);

      setSession(response.Session);
      setChallengeParam(response.ChallengeParameters || {});
      setStep(2);
    } catch (err) {
      console.error('Custom auth initiation failed:', err);
      setMessage(err.message || 'Custom Auth failed.');
    }
  };

  const sendChallengeAnswer = async () => {
    try {
      const respondCommand = new RespondToAuthChallengeCommand({
        ChallengeName: 'CUSTOM_CHALLENGE',
        ClientId: poolData.ClientId,
        ChallengeResponses: {
          USERNAME: email,
          ANSWER: challengeAnswer
        },
        Session: session
      });

      const response = await cognitoClient.send(respondCommand);
      console.log('Challenge response:', response);

      if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
        // Next round of challenge (like Q2)
        setSession(response.Session);
        setChallengeParam(response.ChallengeParameters || {});
        setChallengeAnswer('');
        setStep(step + 1);
      } else {
        // Auth complete
        const token = response.AuthenticationResult.IdToken;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        setMessage('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Challenge failed:', err);
      setMessage(err.message || 'Challenge failed.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <div style={{ marginTop: '18px', fontSize: '1.05rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
          Register
        </Link>
      </div>
    </div>
  );
}