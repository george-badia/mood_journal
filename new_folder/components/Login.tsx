
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Image */}
      <div className="hidden md:flex w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80')" }}>
        {/* you can overlay text or gradient here if you want */}
      </div>

      {/* Right Half - Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brand-primary">MoodFlow</h1>
            <p className="mt-2 text-gray-600">
              {isLoginView ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
                placeholder=" "
                required
                disabled={loading}
              />
              <label 
                htmlFor="email" 
                className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
              >
                Email address
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
                placeholder=" "
                required
                disabled={loading}
              />
              <label 
                htmlFor="password" 
                className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
              >
                Password
              </label>
            </div>

            {/* Error */}
            {error && <p className="text-sm text-center text-red-500">{error}</p>}

            {/* Button */}
            <div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3 px-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-400 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  isLoginView ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Switch Login / Signup */}
          <p className="text-center text-sm text-gray-600">
            {isLoginView ? "Don't have an account?" : 'Already have an account?'}
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(''); }} 
              className="font-semibold text-brand-primary hover:underline ml-2" 
              disabled={loading}
            >
              {isLoginView ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {/* Demo Info */}
          <div className="text-center text-xs text-gray-400">
            <p>For demo: user@moodflow.ai / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
