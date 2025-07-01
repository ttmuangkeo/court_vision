import React, { useState, useEffect } from 'react';
import { useAuth } from '../../common/AuthContext';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '../../common/auth/LoginForm';
import RegisterForm from '../../common/auth/RegisterForm';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { user, loading } = useAuth();
    const [searchParams] = useSearchParams();

    // Check URL parameters on component mount
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'register') {
            setIsLogin(false);
        }
    }, [searchParams]);

    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
        window.location.href = '/dashboard';
        return null;
    }

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="basketball-pattern"></div>
            </div>
            
            <div className="auth-container">
                <div className="auth-brand">
                    <div className="brand-logo">🏀</div>
                    <h1>Court Vision</h1>
                    <p>Advanced Basketball Analytics Platform</p>
                </div>

                <div className="auth-form-wrapper">
                    {isLogin ? (
                        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                    ) : (
                        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>

                <div className="auth-features">
                    <h3>Why Court Vision?</h3>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h4>Advanced Analytics</h4>
                            <p>Get deep insights into player and team performance</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏷️</div>
                            <h4>Live Tagging</h4>
                            <p>Tag plays in real-time during games</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔮</div>
                            <h4>Smart Predictions</h4>
                            <p>Data-driven predictions and insights</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <h4>Defensive Scouting</h4>
                            <p>Generate counter-strategies for any player</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage; 