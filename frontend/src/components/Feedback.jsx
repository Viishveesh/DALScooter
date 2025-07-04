import React from 'react';
import { useParams } from 'react-router-dom';

export default function Feedback() {
    const { bookingId } = useParams();
    return <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Provide Feedback</h1>
        <p>This page will contain a form to submit feedback for booking ID: <strong>{bookingId}</strong>.</p>
    </div>;
}