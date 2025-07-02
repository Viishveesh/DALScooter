import React, { useState } from 'react';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <h2>Login</h2>

      {step === 1 && (
        <div>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={initiateUserPasswordAuth}>Login</button>
        </div>
      )}

      {step > 1 && (
        <div>
          <p>
            {
              challengeParam?.question
                ? `Security Question: ${challengeParam.question}`
                : challengeParam?.cipherText
                ? `Decrypt this: ${challengeParam.cipherText}`
                : "Awaiting next challenge..."
            }
          </p>
          <input placeholder="Your Answer" value={challengeAnswer} onChange={e => setChallengeAnswer(e.target.value)} />
          <button onClick={sendChallengeAnswer}>Submit</button>
        </div>
      )}

      <p>{message}</p>
    </div>
  );
}