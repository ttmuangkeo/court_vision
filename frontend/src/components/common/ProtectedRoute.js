import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { user, loading } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏀</div>
                    <div>Loading Court Vision...</div>
                </div>
            </div>
        );
    }

    // If route requires auth and user is not authenticated
    if (requireAuth && !user) {
        return <Navigate to="/" replace />;
    }

    // If route is for non-authenticated users and user is authenticated
    if (!requireAuth && user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render the protected content
    return children;
};

export default ProtectedRoute; 