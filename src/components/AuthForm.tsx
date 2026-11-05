import { useState, type FormEvent } from 'react';
import { Calendar, Mail, Lock, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Props = {
  mode: 'login' | 'register';
  onNavigate: (page: 'login' | 'register' | 'landing') => void;
};

export default function AuthForm({ mode, onNavigate }: Props) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isLogin) {
      // onAuthStateChange will update the session; App will redirect
    } else {
      setSuccess('Account created! You can now sign in.');
      setEmail('');
      setPassword('');
      setTimeout(() => onNavigate('login'), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-maroon-950 text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-saffron-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-sm text-gold-200/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="bg-maroon-900/80 backdrop-blur-xl border border-gold-500/15 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-400 to-maroon-600 flex items-center justify-center shadow-lg shadow-saffron-500/30 mb-4">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-gold-200/60 mt-1">
              {isLogin
                ? 'Sign in to manage your events'
                : 'Start planning your events in minutes'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gold-200/80 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-gold-500/15 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-200/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-300/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-gold-500/15 focus:border-saffron-500/50 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all text-white placeholder:text-gold-300/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-300/40 hover:text-gold-200/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gold-200/60 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => onNavigate(isLogin ? 'register' : 'login')}
              className="text-saffron-400 hover:text-saffron-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
