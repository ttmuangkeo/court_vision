import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './AuthForms.css';

const LoginForm = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'Email or username is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        const result = await login(formData.emailOrUsername, formData.password);
        setIsLoading(false);

        if (!result.success) {
            setErrors({ general: result.error });
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form-header">
                <h2>Welcome Back to Court Vision</h2>
                <p>Sign in to continue your basketball analytics journey</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {errors.general && (
                    <div className="error-message general">
                        {errors.general}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username</label>
                    <input
                        type="text"
                        id="emailOrUsername"
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        className={errors.emailOrUsername ? 'error' : ''}
                        placeholder="Enter your email or username"
                        disabled={isLoading}
                    />
                    {errors.emailOrUsername && (
                        <span className="error-text">{errors.emailOrUsername}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        placeholder="Enter your password"
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <span className="error-text">{errors.password}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="auth-form-footer">
                <p>
                    Don't have an account?{' '}
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={onSwitchToRegister}
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm; 