import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <main className="home">

            {/* ────── Top Nav ────── */}
            <header className="navbar">
                <div className="logo">
                    {/* swap out for your real logo */}
                    <img src="/assets/logo.png" alt="DAL Scooter logo" />
                </div>

                {/* Mobile hamburger could live here later */}
                <nav>
                    {/* in production you’ll swap href for a real Checkout */}
                    <Link to="/login" className="login-btn">Login</Link>
                    <Link to="/book" className="book-btn">Book Now</Link>
                </nav>
            </header>

            {/* ────── Hero Banner ────── */}
            <section className="hero">
                <div className="overlay">
                    <h1>Explore Halifax in a Whole New Way!</h1>
                    <p>
                        Glide through the peninsula on a zero-emission DAL Scooter –<br/>
                        no parking headaches, just pure city-sightseeing fun.
                    </p>
                    <Link to="/book" className="primary-btn">Book Now</Link>
                </div>
            </section>

            {/* ────── Tours / Products ────── */}
            <section className="tours">
                <h2 className="section-tag">Tours</h2>
                <h3>DAL Scooter Nova Scotia: Explore Halifax with a Fun and Effortless Ride</h3>

                <div className="tour-cards">
                    {/* Tour card #1 */}
                    <article className="card">
                        <img src="/assets/tour1.jpg" alt="Harbour Lights" />
                        <h4>Seaside Evening Spin – 2 hr</h4>
                        <p>See the stunning waterfront while coasting on a DAL Scooter.</p>
                        <Link to="/tours/harbour" className="secondary-btn">Book It</Link>
                    </article>

                    {/* Tour card #2 */}
                    <article className="card">
                        <img src="/assets/tour2.jpg" alt="City Spin" />
                        <h4>City Spin – 3 hr</h4>
                        <p>Hit every must-see spot – Citadel Hill, Hydrostone, Point Pleasant &amp; more.</p>
                        <Link to="/tours/city-spin" className="secondary-btn">Book It</Link>
                    </article>

                    {/* Tour card #3 */}
                    <article className="card">
                        <img src="/assets/tour3.jpg" alt="Custom Tours" />
                        <h4>Custom Tours</h4>
                        <p>Have an Insta-worthy idea? We’ll map a route that’s uniquely yours.</p>
                        <Link to="/tours/custom" className="secondary-btn">Inquire</Link>
                    </article>
                </div>
            </section>

            {/* ────── Location Section ────── */}
            <section className="find-us">
                <h2>Where to Find Us</h2>
                <p>
                    We’re at <strong>1239 Lower Water St.</strong> inside Queen’s Marque.
                    Look for the teal DAL Scooter trailer on the boardwalk.<br/>
                    Pick-ups start at 10 am daily (seasonal).
                </p>
                <a href="https://maps.app.goo.gl/" target="_blank" rel="noopener noreferrer" className="primary-btn">
                    See Directions
                </a>
            </section>

            <div className="map-placeholder">
                <img src="/assets/map-placeholder.png" alt="Google Map placeholder" />
            </div>

            {/* ────── Instagram Placeholder ────── */}
            <section className="instagram">
                <h2>Check Out our Instagram</h2>
                <div className="insta-carousel">
                    <div className="carousel-placeholder">[Instagram feed placeholder]</div>
                </div>
                <a href="https://instagram.com/dalscooter" target="_blank" rel="noopener noreferrer" className="secondary-btn">
                    View on Instagram
                </a>
            </section>

            {/* ────── Testimonials Placeholder ────── */}
            <section className="testimonials">
                <h2>See What People are Saying About Their Experience</h2>
                <div className="testimonial-carousel">
                    <div className="testimonial-card">No reviews yet.</div>
                </div>
            </section>

            <footer className="footer">
                © {new Date().getFullYear()} DAL Scooter Nova Scotia
            </footer>
        </main>
    );
}
