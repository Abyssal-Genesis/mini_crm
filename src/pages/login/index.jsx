import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from './components/WelcomeHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import DemoCredentials from './components/DemoCredentials';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData?.isAuthenticated) {
          navigate('/dashboard');
        }
      } catch (error) {
        // Clear invalid user data
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-surface rounded-2xl shadow-modal border border-border p-8">
            {/* Welcome Header */}
            <WelcomeHeader />

            {/* Login Form */}
            <LoginForm />

            {/* Demo Credentials */}
            <DemoCredentials />

            {/* Security Badges */}
            <SecurityBadges />
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-text-secondary">
              © {new Date()?.getFullYear()} Mini CRM. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;