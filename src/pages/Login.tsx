import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } else {
      if (!name.trim()) { setError('Name is required'); return; }
      if (!email.trim()) { setError('Email is required'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      const result = await signup(name, email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Email already registered');
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <GraduationCap className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-dark-100">StudyHub</h1>
          <p className="text-dark-400 mt-2">Your AI Academic Assistant</p>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
          <h2 className="text-xl font-semibold text-dark-100 mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="student@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 text-accent hover:text-accent-light font-medium">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
