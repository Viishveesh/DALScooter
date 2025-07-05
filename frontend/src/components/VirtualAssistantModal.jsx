import React, { useState, useEffect, useRef } from 'react';
import './VirtualAssistantModal.css';

// Placeholder bot logic
const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    if (input.includes("booking") || input.includes("reserve")) {
        return "You can make a new reservation by clicking the 'Make a New Reservation' button on your dashboard. What else can I help with?";
    }
    if (input.includes("code") || input.includes("access")) {
        return "To see your access code, click the 'Reveal Code' button on your current booking. Is there anything else?";
    }
    if (input.includes("help") || input.includes("support")) {
        return "For support from a franchise operator, please use the 'Contact Franchise Support' button. How can I assist further?";
    }
    return "I'm still in training and can only help with basic navigation. You can ask about 'booking', 'access code', or 'support'.";
};


export default function VirtualAssistantModal({ onClose }) {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your virtual assistant. How can I help you navigate the site today?", sender: 'bot' }
    ]);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        const botResponseText = getBotResponse(userInput);

        setTimeout(() => {
            const botMessage = { text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);

        setUserInput('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Virtual Assistant</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="messages-list">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="modal-footer">
                    <form onSubmit={handleSendMessage} className="message-form">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a question..."
                            autoFocus
                        />

                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}