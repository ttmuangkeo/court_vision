import React, { useState } from 'react';
import './OnboardingSteps.css';

const WelcomeStep = ({ data, onUpdate, onNext, isFirstStep, isLastStep }) => {
    const [formData, setFormData] = useState({
        experienceLevel: data.experienceLevel || 'beginner',
        interests: data.interests || []
    });

    const experienceLevels = [
        {
            value: 'beginner',
            label: 'Beginner',
            description: 'New to basketball analytics',
            icon: '🎯'
        },
        {
            value: 'intermediate',
            label: 'Intermediate',
            description: 'Some experience with basketball analysis',
            icon: '📊'
        },
        {
            value: 'advanced',
            label: 'Advanced',
            description: 'Experienced with basketball analytics',
            icon: '🏆'
        },
        {
            value: 'expert',
            label: 'Expert',
            description: 'Professional or coach level',
            icon: '👑'
        }
    ];

    const interestOptions = [
        { value: 'player-analysis', label: 'Player Analysis', icon: '👤' },
        { value: 'team-strategy', label: 'Team Strategy', icon: '🏀' },
        { value: 'game-prediction', label: 'Game Predictions', icon: '🔮' },
        { value: 'defensive-scouting', label: 'Defensive Scouting', icon: '🛡️' },
        { value: 'play-tagging', label: 'Live Play Tagging', icon: '🏷️' },
        { value: 'statistics', label: 'Advanced Statistics', icon: '📈' }
    ];

    const handleExperienceChange = (level) => {
        setFormData(prev => ({
            ...prev,
            experienceLevel: level
        }));
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleContinue = () => {
        onUpdate(formData);
        onNext();
    };

    return (
        <div className="welcome-step">
            <div className="welcome-message">
                <div className="welcome-icon">🏀</div>
                <h3>Welcome to Court Vision!</h3>
                <p>
                    We're excited to help you dive deep into basketball analytics. 
                    Let's personalize your experience to match your interests and expertise level.
                </p>
            </div>

            <div className="form-section">
                <h4>What's your experience level with basketball analytics?</h4>
                <div className="experience-options">
                    {experienceLevels.map((level) => (
                        <div
                            key={level.value}
                            className={`experience-option ${formData.experienceLevel === level.value ? 'selected' : ''}`}
                            onClick={() => handleExperienceChange(level.value)}
                        >
                            <div className="option-icon">{level.icon}</div>
                            <div className="option-content">
                                <div className="option-label">{level.label}</div>
                                <div className="option-description">{level.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-section">
                <h4>What interests you most? (Select all that apply)</h4>
                <div className="interests-grid">
                    {interestOptions.map((interest) => (
                        <div
                            key={interest.value}
                            className={`interest-option ${formData.interests.includes(interest.value) ? 'selected' : ''}`}
                            onClick={() => handleInterestToggle(interest.value)}
                        >
                            <div className="interest-icon">{interest.icon}</div>
                            <div className="interest-label">{interest.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="step-actions">
                <button 
                    onClick={handleContinue}
                    className="continue-button"
                    disabled={formData.interests.length === 0}
                >
                    Continue to Team Selection →
                </button>
            </div>
        </div>
    );
};

export default WelcomeStep; 