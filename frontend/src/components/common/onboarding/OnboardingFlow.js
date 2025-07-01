import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import WelcomeStep from './steps/WelcomeStep';
import TeamSelectionStep from './steps/TeamSelectionStep';
import PlayerPreferencesStep from './steps/PlayerPreferencesStep';
import AppTutorialStep from './steps/AppTutorialStep';
import './OnboardingFlow.css';

const OnboardingFlow = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState({
        favoriteTeams: [],
        favoritePlayers: [],
        experienceLevel: 'beginner',
        interests: []
    });
    const { completeOnboarding, user } = useAuth();

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to Court Vision',
            component: WelcomeStep,
            description: 'Get started with basketball analytics'
        },
        {
            id: 'teams',
            title: 'Choose Your Teams',
            component: TeamSelectionStep,
            description: 'Select your favorite NBA teams'
        },
        {
            id: 'players',
            title: 'Follow Players',
            component: PlayerPreferencesStep,
            description: 'Pick players you want to track'
        },
        {
            id: 'tutorial',
            title: 'Learn the App',
            component: AppTutorialStep,
            description: 'Quick tutorial on key features'
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            // Save user preferences to backend
            await saveUserPreferences();
            
            // Mark onboarding as complete
            completeOnboarding();
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const saveUserPreferences = async () => {
        // This would typically save to your backend
        // For now, we'll just store in localStorage
        localStorage.setItem('userPreferences', JSON.stringify(onboardingData));
    };

    const updateOnboardingData = (newData) => {
        setOnboardingData(prev => ({
            ...prev,
            ...newData
        }));
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
                <div className="step-indicator">
                    Step {currentStep + 1} of {steps.length}
                </div>
            </div>

            <div className="onboarding-content">
                <div className="step-header">
                    <h2>{steps[currentStep].title}</h2>
                    <p>{steps[currentStep].description}</p>
                </div>

                <div className="step-content">
                    <CurrentStepComponent
                        data={onboardingData}
                        onUpdate={updateOnboardingData}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirstStep={currentStep === 0}
                        isLastStep={currentStep === steps.length - 1}
                    />
                </div>
            </div>

            <div className="onboarding-footer">
                <div className="step-navigation">
                    {currentStep > 0 && (
                        <button 
                            onClick={handleBack}
                            className="nav-button secondary"
                        >
                            ← Back
                        </button>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        className="nav-button primary"
                    >
                        {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow; 