import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import { toast } from 'react-toastify';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toast.error('Google login failed: ' + error.message);
      }
    } catch (error) {
      toast.error('An error occurred during Google login');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          toast.error('Sign up failed: ' + error.message);
        } else {
          toast.success('Account created! Please check your email to verify your account.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error('Sign in failed: ' + error.message);
        } else {
          toast.success('Successfully signed in!');
          onLogin();
          onClose();
        }
      }
    } catch (error) {
      toast.error('An error occurred during authentication');
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back!'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isSignUp 
              ? 'Sign up to access your account and start shopping' 
              : 'Sign in to access your account and continue shopping'
            }
          </p>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              disabled={loading}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail('');
              setPassword('');
            }}
            className="text-cyan-600 hover:text-cyan-700 font-medium mb-4"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 hover:border-cyan-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-3 mb-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? 'Loading...' : 'Continue with Google'}</span>
          </button>

          <p className="text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. 
            Create an account to track orders and get exclusive deals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;