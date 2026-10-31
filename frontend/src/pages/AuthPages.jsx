import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input, Button } from '../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to TaskFlow', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-brand-600 flex items-center justify-center font-bold text-sm text-white mx-auto mb-3">
            TF
          </div>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Sign in to TaskFlow</h2>
          <p className="text-xs text-gray-400 mt-1">Issue and project tracking for engineering teams</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@company.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-border text-center">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-400 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, formData.fullName);
      addToast('Account created successfully', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-brand-600 flex items-center justify-center font-bold text-sm text-white mx-auto mb-3">
            TF
          </div>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Create your account</h2>
          <p className="text-xs text-gray-400 mt-1">Get started with your team's workflow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Alex Mercer"
            required
          />

          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="alexmercer"
            required
          />

          <Input
            label="Work Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="alex@company.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-border text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

