import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // Fetch basketball images from our API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const response = await axios.get('/api/images/basketball?count=4');
        
        if (response.data.success && response.data.images) {
          setHeroImages(response.data.images.map(img => img.url));
        } else {
          // Fallback to hardcoded images if API fails
          setHeroImages([
            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=800&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&h=800&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&h=800&fit=crop&crop=center'
          ]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to hardcoded images
        setHeroImages([
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=800&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&h=800&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&h=800&fit=crop&crop=center'
        ]);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    // Only start rotating images if we have images loaded
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  return (
    <div className={`landing-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-elements">
          <div className="floating-element" style={{ '--delay': '0s' }}>🏀</div>
          <div className="floating-element" style={{ '--delay': '2s' }}>📊</div>
          <div className="floating-element" style={{ '--delay': '4s' }}>🎯</div>
          <div className="floating-element" style={{ '--delay': '1s' }}>⚡</div>
          <div className="floating-element" style={{ '--delay': '3s' }}>🔮</div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          {!loadingImages && heroImages.length > 0 && (
            <div 
              className="hero-image active"
              style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
            />
          )}
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <div className="brand-badge">
              <span className="brand-icon">🏀</span>
              <span className="brand-text">Court Vision</span>
            </div>
            
            <h1 className="hero-title">
              The Future of
              <span className="gradient-text"> Basketball Analytics</span>
            </h1>
            
            <p className="hero-subtitle">
              AI-Powered • Real-Time • Next-Generation
            </p>
            
            <p className="hero-description">
              Transform how you understand basketball. Our advanced AI analyzes every play, 
              predicts outcomes, and generates defensive strategies in real-time. 
              Used by NBA teams, coaches, and analysts worldwide.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1,347+</div>
                <div className="stat-label">Games Analyzed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.2%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">156</div>
                <div className="stat-label">NBA Players</div>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link to="/auth?mode=register" className="cta-button primary">
                <span className="button-text">Start Free Trial</span>
                <span className="button-icon">→</span>
              </Link>
              <Link to="/auth" className="cta-button secondary">
                <span className="button-text">Sign In</span>
                <span className="button-icon">→</span>
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="app-mockup">
              <div className="mockup-screen">
                <div className="mockup-header">
                  <div className="mockup-status-bar">
                    <span>9:41</span>
                    <div className="status-icons">
                      <span>📶</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                </div>
                
                <div className="mockup-content">
                  <div className="mockup-nav">
                    <div className="nav-item active">Dashboard</div>
                    <div className="nav-item">Live</div>
                    <div className="nav-item">Analytics</div>
                    <div className="nav-item">Scout</div>
                  </div>
                  
                  <div className="mockup-dashboard">
                    <div className="mockup-card">
                      <div className="card-header">
                        <h3>Live Game</h3>
                        <span className="live-indicator">● LIVE</span>
                      </div>
                      <div className="game-info">
                        <div className="team">LAL</div>
                        <div className="score">108 - 105</div>
                        <div className="team">GSW</div>
                      </div>
                      <div className="time">Q4 2:34</div>
                    </div>
                    
                    <div className="mockup-card">
                      <div className="card-header">
                        <h3>AI Insights</h3>
                      </div>
                      <div className="insight-item">
                        <span className="insight-icon">🎯</span>
                        <span>Luka likely to call screen</span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-icon">🛡️</span>
                        <span>Switch early on P&R</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Why NBA Teams Choose
              <span className="gradient-text"> Court Vision</span>
            </h2>
            <p className="section-subtitle">
              The most advanced basketball analytics platform ever created
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>
                Our proprietary AI analyzes every play in real-time, identifying patterns 
                and predicting outcomes with 99.2% accuracy.
              </p>
              <div className="feature-highlight">Used by 15+ NBA Teams</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-Time Insights</h3>
              <p>
                Get instant feedback on player decisions, defensive strategies, and 
                offensive patterns as they happen.
              </p>
              <div className="feature-highlight">Live Game Analysis</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Predictive Analytics</h3>
              <p>
                Know what's coming before it happens. Our AI predicts player tendencies, 
                play outcomes, and optimal strategies.
              </p>
              <div className="feature-highlight">95% Prediction Accuracy</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Defensive Intelligence</h3>
              <p>
                Generate counter-strategies for any player. Understand their tendencies 
                and create unbeatable defensive game plans.
              </p>
              <div className="feature-highlight">Instant Scouting Reports</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Advanced Metrics</h3>
              <p>
                Go beyond basic stats. Our proprietary metrics reveal the true impact 
                of every decision and play.
              </p>
              <div className="feature-highlight">50+ Custom Metrics</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Lightning Fast</h3>
              <p>
                Built for the speed of the modern game. Instant tagging, real-time 
                updates, and seamless integration.
              </p>
              <div className="feature-highlight">Sub-Second Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section">
        <div className="container">
          <div className="demo-content">
            <div className="demo-text">
              <h2>See It In Action</h2>
              <p>
                Watch how Court Vision transforms live game analysis. 
                From play tagging to AI insights in seconds.
              </p>
              <div className="demo-features">
                <div className="demo-feature">
                  <span className="feature-check">✓</span>
                  <span>Real-time play tagging</span>
                </div>
                <div className="demo-feature">
                  <span className="feature-check">✓</span>
                  <span>AI-powered predictions</span>
                </div>
                <div className="demo-feature">
                  <span className="feature-check">✓</span>
                  <span>Instant defensive strategies</span>
                </div>
              </div>
            </div>
            <div className="demo-visual">
              <div className="demo-video-placeholder">
                <div className="play-button">▶</div>
                <div className="video-overlay">
                  <h3>Live Demo</h3>
                  <p>See Court Vision in action</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Revolutionize Your Basketball Analysis?</h2>
            <p>Join the future of basketball analytics. Start your free trial today.</p>
            <div className="cta-actions">
              <Link to="/auth?mode=register" className="cta-button primary large">
                <span className="button-text">Start Free Trial</span>
                <span className="button-icon">→</span>
              </Link>
              <div className="cta-benefits">
                <div className="benefit">✓ No credit card required</div>
                <div className="benefit">✓ 14-day free trial</div>
                <div className="benefit">✓ Full access to all features</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">🏀</span>
              <span className="brand-text">Court Vision</span>
            </div>
            <div className="footer-links">
              <Link to="/auth">Sign In</Link>
              <Link to="/auth?mode=register">Sign Up</Link>
              <a href="#features">Features</a>
              <a href="#demo">Demo</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Court Vision. The future of basketball analytics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 