import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import RegistrationForm from './components/RegistrationForm';
import PasswordRequirements from './components/PasswordRequirements';
import TrustSignals from './components/TrustSignals';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (formData) => {
    try {
      setIsLoading(true);
      setError('');

      const { error: signUpError } = await signUp(
        formData?.email, 
        formData?.password,
        {
          full_name: formData?.fullName,
          role: 'member' // Default role
        }
      );

      if (signUpError) {
        setError(signUpError);
        return;
      }

      setSuccess(true);
      // Don't redirect immediately, show success message first
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please check your email to confirm your account.' 
          }
        });
      }, 2000);

    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Please check your email to confirm your account before signing in.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to login page...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Left side - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join our CRM platform and start managing your leads</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <RegistrationForm
                onSubmit={handleRegister}
                isLoading={isLoading}
              />

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Features & Trust Signals */}
        <div className="hidden lg:flex lg:flex-1 bg-indigo-600 items-center justify-center p-8">
          <div className="max-w-md text-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Powerful CRM Platform</h2>
              <p className="text-indigo-100 text-lg leading-relaxed">
                Streamline your sales process, manage customer relationships, and track leads with our comprehensive CRM solution.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                'Customer Management',
                'Lead Tracking & Analytics',
                'Activity Timeline',
                'Performance Dashboard',
                'Export & Reporting Tools'
              ]?.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust Signals */}
            <TrustSignals />
          </div>
        </div>
      </div>
      {/* Password Requirements (Mobile) */}
      <div className="lg:hidden p-4">
        <PasswordRequirements password="" />
      </div>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-text-secondary text-sm">
              © {new Date()?.getFullYear()} Mini CRM. All rights reserved. | 
              <span className="ml-1">
                <a href="#" className="text-primary hover:text-primary/80 transition-smooth">Privacy Policy</a>
              </span>
              <span className="mx-2">•</span>
              <span>
                <a href="#" className="text-primary hover:text-primary/80 transition-smooth">Terms of Service</a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;