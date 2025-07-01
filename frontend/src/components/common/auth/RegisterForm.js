import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './AuthForms.css';

const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

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
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Name validation (optional but recommended)
        if (formData.firstName && formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }
        
        if (formData.lastName && formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        const result = await register(formData);
        setIsLoading(false);

        if (!result.success) {
            setErrors({ general: result.error });
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form-header">
                <h2>Join Court Vision</h2>
                <p>Create your account to start analyzing basketball like a pro</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {errors.general && (
                    <div className="error-message general">
                        {errors.general}
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? 'error' : ''}
                            placeholder="First name (optional)"
                            disabled={isLoading}
                        />
                        {errors.firstName && (
                            <span className="error-text">{errors.firstName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={errors.lastName ? 'error' : ''}
                            placeholder="Last name (optional)"
                            disabled={isLoading}
                        />
                        {errors.lastName && (
                            <span className="error-text">{errors.lastName}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <span className="error-text">{errors.email}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="Choose a unique username"
                        disabled={isLoading}
                    />
                    {errors.username && (
                        <span className="error-text">{errors.username}</span>
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
                        placeholder="Create a strong password"
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <span className="error-text">{errors.password}</span>
                    )}
                    <div className="password-requirements">
                        <small>Password must be at least 8 characters with uppercase, lowercase, and number</small>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <span className="error-text">{errors.confirmPassword}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="auth-form-footer">
                <p>
                    Already have an account?{' '}
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={onSwitchToLogin}
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm; 