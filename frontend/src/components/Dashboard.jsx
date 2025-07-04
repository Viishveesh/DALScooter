import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Mock data to simulate user's bookings
const mockBookings = {
    current: {
        id: 'BK789123',
        type: 'eBike',
        model: 'City-Cruiser X',
        startTime: '10:00 AM',
        endTime: '5:00 PM',
        accessCode: '****', // Masked until requested
    },
    past: [
        { id: 'BK654321', type: 'Gyroscooter', date: '2024-07-15', status: 'Completed' },
        { id: 'BK543210', type: 'eBike', date: '2024-07-10', status: 'Completed' },
    ]
};

// Placeholder Chatbot Component
const ChatbotWidget = () => (
    <div className="chatbot-widget">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 12c0 2.252.992 4.312 2.624 5.793.12.1.206.222.252.355l.375 1.5a.75.75 0 0 0 .938.649l1.791-.896a8.25 8.25 0 0 0 1.026-.524" />
        </svg>
    </div>
);


export default function Dashboard() {
    const [userBookings] = useState(mockBookings);
    const email = localStorage.getItem('userEmail');

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {email}</h1>
                <p>Manage your bookings and explore DAL Scooter services.</p>
            </header>

            <main className="dashboard-main">
                <section className="dashboard-section reserve-section">
                    <h2>Ready for a new adventure?</h2>
                    <p>Explore Halifax with our fun and eco-friendly scooters.</p>
                    <Link to="/reserve" className="btn-primary">Make a New Reservation</Link>
                </section>

                <section className="dashboard-section">
                    <h2>My Bookings</h2>
                    <div className="bookings-layout">
                        {/* Current Booking Card */}
                        {userBookings.current ? (
                            <div className="card booking-card current-booking">
                                <div className="card-header">
                                    <h3>Current Booking</h3>
                                    <span className="booking-id">ID: {userBookings.current.id}</span>
                                </div>
                                <div className="card-content">
                                    <p><strong>Type:</strong> {userBookings.current.type} ({userBookings.current.model})</p>
                                    <p><strong>Usage Time:</strong> {userBookings.current.startTime} - {userBookings.current.endTime}</p>
                                    <p><strong>Access Code:</strong> <span className="access-code">{userBookings.current.accessCode}</span></p>
                                    <button className="btn-secondary" onClick={() => alert('Virtual assistant would retrieve your code.')}>Reveal Code</button>
                                </div>
                            </div>
                        ) : (
                            <p>You have no active bookings.</p>
                        )}

                        {/* Past Bookings List */}
                        <div className="card booking-card past-bookings">
                            <div className="card-header">
                                <h3>Booking History</h3>
                            </div>
                            <div className="card-content">
                                <ul>
                                    {userBookings.past.map(booking => (
                                        <li key={booking.id}>
                                            <span>{booking.date} - {booking.type}</span>
                                            <Link to={`/feedback/${booking.id}`} className="btn-feedback">Provide Feedback</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section support-section">
                    <h2>Need Help?</h2>
                    <p>Our team is here to assist you with any questions or concerns.</p>
                    <Link to="/support" className="btn-secondary">Contact Franchise Support</Link>
                </section>
            </main>

            <ChatbotWidget />
        </div>
    );
}