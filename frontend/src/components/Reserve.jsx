import React, { useState } from 'react';
import './Reserve.css';

// Mock data for the different tour/booking options
const reservationOptions = [
    {
        id: 1,
        title: 'City Explorer eBike Tour',
        description: 'A 2-hour guided tour hitting all the must-see spots in downtown Halifax, from Citadel Hill to the Hydrostone market.',
        duration: '2 Hours (approx.)',
        price: 79.00,
        image: '/assets/tour2.jpg'
    },
    {
        id: 2,
        title: 'Waterfront Glide Experience',
        description: 'Glide along the stunning Halifax boardwalk on a 1hr scooter adventure! Soak in the waterfront views and hear fascinating history.',
        duration: '1 Hour (approx.)',
        price: 59.00,
        image: '/assets/tour1.jpg'
    },
    {
        id: 3,
        title: 'Custom Adventure',
        description: 'Have a specific route in mind? Book a scooter and create your own tour. Perfect for photographers and urban explorers.',
        duration: 'Flexible',
        price: 49.00,
        image: '/assets/tour3.jpg'
    }
];

export default function Reserve() {
    const [activeTab, setActiveTab] = useState('Tours');

    // In a real app, this would filter options based on the active tab
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className="reserve-container">
            <header className="reserve-header">
                <img src="/assets/logo.png" alt="DAL Scooter Logo" className="reserve-logo" />
                <h1>Booking System</h1>
            </header>

            <nav className="reserve-nav">
                {['Tours', 'Custom Time', 'Private Event', 'Gift Certificates'].map(tab => (
                    <button
                        key={tab}
                        className={activeTab === tab ? 'active' : ''}
                        onClick={() => handleTabClick(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <main className="booking-list">
                {reservationOptions.map(option => (
                    <div className="booking-option-card" key={option.id}>
                        <div className="option-image">
                            <img src={option.image} alt={option.title} />
                        </div>
                        <div className="option-details">
                            <h3>{option.title}</h3>
                            <p>{option.description}</p>
                            <span>Duration: {option.duration}</span>
                        </div>
                        <div className="option-actions">
                            <div className="price">CA${option.price.toFixed(2)}</div>
                            <button className="btn-book-now" onClick={() => alert(`Booking for "${option.title}" would proceed here.`)}>Book Now</button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}