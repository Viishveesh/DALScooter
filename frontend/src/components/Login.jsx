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

// --- Helper function for Caesar Cipher (placeholder) ---
// In a real app, the backend would provide the shifted text and expect the original.
// Here, we'll simulate it on the front-end for UI purposes.
const caesarCipher = (str, amount) => {
  if (amount < 0) return caesarCipher(str, amount + 26);
  let output = '';
  for (let i = 0; i < str.length; i++) {
    let c = str[i];
    if (c.match(/[a-z]/i)) {
      let code = str.charCodeAt(i);
      if (code >= 65 && code <= 90) { // Uppercase
        c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
      } else if (code >= 97 && code <= 122) { // Lowercase
        c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
      }
    }
    output += c;
  }
  return output;
};


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: password, 2: security Q&A, 3: caesar
  const [session, setSession] = useState(null);
  const [challengeParam, setChallengeParam] = useState({});
  const [answer, setAnswer] = useState(''); // For both Q&A and Caesar
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // This will now handle submissions for all steps
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (step === 1) {
        // Step 1: Initial Password Auth, then start custom flow
        await initiateUserPasswordAuth();
      } else {
        // Steps 2 & 3: Respond to custom challenges
        await sendChallengeAnswer();
      }
    } catch (err) {
      setMessage(err.message || 'An error occurred.');
      // Keep loading false if error happens here so user can retry
      setIsLoading(false);
    }
  };

  const initiateUserPasswordAuth = async () => {
    // This function remains the same, it's the first gate.
    try {
      const authCommand = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: poolData.ClientId,
        AuthParameters: { USERNAME: email, PASSWORD: password }
      });
      await cognitoClient.send(authCommand);
      // If password is correct, immediately start the custom auth flow for MFA
      await initiateCustomAuth();
    } catch (err) {
      console.error('Initial auth failed:', err);
      setMessage(err.message || 'Login failed. Check your email and password.');
      setIsLoading(false);
    }
  };

  const initiateCustomAuth = async () => {
    // This function will trigger the *first* custom challenge (Q&A)
    const customAuthCommand = new InitiateAuthCommand({
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: poolData.ClientId,
      AuthParameters: { USERNAME: email }
    });
    const response = await cognitoClient.send(customAuthCommand);

    setSession(response.Session);
    setChallengeParam(response.ChallengeParameters || {});
    setStep(2); // Move to Q&A step
    setIsLoading(false); // Ready for user input
  };

  const sendChallengeAnswer = async () => {
    const respondCommand = new RespondToAuthChallengeCommand({
      ChallengeName: 'CUSTOM_CHALLENGE',
      ClientId: poolData.ClientId,
      ChallengeResponses: { USERNAME: email, ANSWER: answer },
      Session: session
    });
    const response = await cognitoClient.send(respondCommand);

    setAnswer(''); // Clear answer for next step

    if (response.ChallengeName === 'CUSTOM_CHALLENGE') {

      // --- START: TEMPORARY MOCK DATA ---
      const challengeParameters = response.ChallengeParameters || {};
      if (!challengeParameters.clue) {
        challengeParameters.clue = "Decrypt the word: KDOLID["; // Mocked Caesar for HALIFAX
      }
      // --- END: TEMPORARY MOCK DATA ---

      setSession(response.Session);
      // Use our modified object instead of the direct response
      setChallengeParam(challengeParameters);
      setStep(3);
      setIsLoading(false);
    } else {
      // Auth complete
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
              <p className="challenge-question">{challengeParam.question || 'Loading question...'}</p>
              <input
                  placeholder="Your Answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
              />
            </>
        );
      case 3: // Caesar Cipher
        return (
            <>
              <h3 className="challenge-title">Final Factor</h3>
              <p className="challenge-question">{challengeParam.clue || 'Loading clue...'}</p>
              <input
                  placeholder="Decrypted Word"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
              />
            </>
        );
      default: // Step 1: Email and Password
        return (
            <>
              <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
              />
              <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
              />
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