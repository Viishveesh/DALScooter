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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [session, setSession] = useState(null);
  const [challengeParam, setChallengeParam] = useState({});
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (step === 1) {
        // This is the single entry point for the entire login flow.
        await initiateAuth();
      } else {
        // This handles all subsequent MFA steps.
        await sendChallengeAnswer();
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setMessage(err.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  // This is the corrected login initiation function.
  const initiateAuth = async () => {
    const authCommand = new InitiateAuthCommand({
      // The AuthFlow now starts with CUSTOM_AUTH, matching the final Terraform config.
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: poolData.ClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password, // The password is now sent as part of the initial custom flow.
      },
    });

    const response = await cognitoClient.send(authCommand);

    // After password verification, Cognito will return our first custom challenge.
    if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
      setSession(response.Session);
      setChallengeParam(response.ChallengeParameters || {});
      setStep(2); // Move to MFA Step 1 (Security Question)
    } else {
      // This path is for other potential states, like forcing a new password.
      // For this project, it indicates an unexpected state.
      setMessage(`Unsupported authentication flow: ${response.ChallengeName}. Please contact support.`);
    }
    setIsLoading(false);
  };

  const sendChallengeAnswer = async () => {
    const respondCommand = new RespondToAuthChallengeCommand({
      ChallengeName: 'CUSTOM_CHALLENGE',
      ClientId: poolData.ClientId,
      ChallengeResponses: { USERNAME: email, ANSWER: answer },
      Session: session,
    });

    const response = await cognitoClient.send(respondCommand);

    setAnswer('');

    // Check if Cognito has issued another challenge (the Caesar Cipher).
    if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
      setSession(response.Session);
      setChallengeParam(response.ChallengeParameters || {});
      setStep(3); // Move to the final factor step.
      setIsLoading(false);
    } else {
      // If no more challenges, authentication is complete.
      const token = response.AuthenticationResult.IdToken;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      setMessage('Login successful!');
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 2: // Security Question
        return (
            <>
              <h3 className="challenge-title">Security Question</h3>
              <p className="challenge-question">{challengeParam.question || 'Loading...'}</p>
              <input placeholder="Your Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus />
            </>
        );
      case 3: // Caesar Cipher
        return (
            <>
              <h3 className="challenge-title">Final Factor</h3>
              <p className="challenge-question">{challengeParam.clue || 'Loading...'}</p>
              <input placeholder="Decrypted Word" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus />
            </>
        );
      default: // Step 1: Email and Password
        return (
            <>
              <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            </>
        );
    }
  };

  return (
      <div className="auth-page-background">
        <div className="auth-container">
          <h2>{step === 1 ? 'Login' : 'Multi-Factor Auth'}</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            {renderStep()}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : (step === 1 ? 'Login' : 'Continue')}
            </button>
          </form>
          <p className="auth-message">{message}</p>
          <div style={{ marginTop: '18px', fontSize: '1.05rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
              Register
            </Link>
          </div>
        </div>
      </div>
  );
}