import React, { useState } from 'react';
import { StudyLoopLogo } from '../common/StudyLoopLogo.tsx';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

// ================= LOGIN PAGE =================
export const LoginPage: React.FC<{
  onNavigate: (route: string) => void;
  onSuccess: (user: any) => void;
}> = ({ onNavigate, onSuccess }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.auth.login({ email, password });
      if (res.success && res.user) {
        showToast('Welcome back to Study Loop!');
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex@studyloop.edu');
    setPassword('studyloop123');
    showToast('Demo student credentials filled!');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7ECF3] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <StudyLoopLogo size="md" showWordmark={true} />
          </div>
          <h1 className="text-xl font-black text-[#172033]">Welcome back</h1>
          <p className="text-xs text-[#778196]">Sign in to resume your study rhythm and revision plan</p>
        </div>

        {/* Demo Account Quick Fill Button */}
        <div className="p-3 bg-[#F0EEFF] border border-[#6857E8]/20 rounded-xl flex items-center justify-between">
          <div className="text-[11px] text-[#6857E8]">
            <strong className="block font-bold">Try Instant Demo Account</strong>
            alex@studyloop.edu / studyloop123
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 text-xs font-bold bg-[#6857E8] text-white rounded-lg hover:bg-[#5645D3] transition-colors"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#172033]">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] font-semibold text-[#6857E8] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FFF2DF] text-[#C24141] text-xs rounded-xl border border-[#C24141]/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E7ECF3] text-xs text-[#778196]">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="font-bold text-[#6857E8] hover:underline"
          >
            Build your study plan
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= SIGNUP PAGE =================
export const SignupPage: React.FC<{
  onNavigate: (route: string) => void;
  onSuccess: (user: any) => void;
}> = ({ onNavigate, onSuccess }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.auth.signup({
        name,
        email,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });
      if (res.success && res.user) {
        showToast('Account created! Welcome to Study Loop.');
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7ECF3] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <StudyLoopLogo size="md" showWordmark={true} />
          </div>
          <h1 className="text-xl font-black text-[#172033]">Create your account</h1>
          <p className="text-xs text-[#778196]">Begin your tailored revision plan and adaptive practice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FFF2DF] text-[#C24141] text-xs rounded-xl border border-[#C24141]/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E7ECF3] text-xs text-[#778196]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-[#6857E8] hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= FORGOT PASSWORD PAGE =================
export const ForgotPasswordPage: React.FC<{ onNavigate: (route: string) => void }> = ({
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.auth.forgotPassword(email);
      setMessage(res.message);
      showToast('Password recovery instructions sent!');
    } catch (err: any) {
      showToast(err.message || 'Error requesting reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7ECF3] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <StudyLoopLogo size="md" showWordmark={true} className="mx-auto" />
          <h1 className="text-xl font-black text-[#172033]">Reset your password</h1>
          <p className="text-xs text-[#778196]">
            Enter your student email and we'll generate recovery verification
          </p>
        </div>

        {message ? (
          <div className="p-4 bg-[#E3F8EF] border border-[#238A66]/30 rounded-2xl text-xs text-[#238A66] space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Recovery link issued!</span>
            </div>
            <p className="leading-relaxed">{message}</p>
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-2 bg-[#238A66] text-white font-bold rounded-xl text-xs"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Send Recovery Instructions</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#E7ECF3]">
          <button
            onClick={() => onNavigate('/login')}
            className="text-xs font-bold text-[#778196] hover:text-[#172033] flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= PRIVACY & TERMS =================
export const LegalPage: React.FC<{ type: 'privacy' | 'terms'; onNavigate: (route: string) => void }> = ({
  type,
  onNavigate,
}) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] select-none">
      <header className="bg-white border-b border-[#E7ECF3] px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <StudyLoopLogo size="sm" showWordmark={true} />
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-bold text-[#6857E8] hover:underline"
          >
            &larr; Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 sm:p-10 my-8 bg-white rounded-3xl border border-[#E7ECF3] shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-[#172033]">
          {isPrivacy ? 'Privacy Policy & Student Data Protection' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-[#778196]">Effective Date: October 2026</p>

        <div className="space-y-4 text-xs text-[#172033] leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                At <strong>Study Loop</strong>, student privacy and syllabus confidentiality are foundational to our mission.
              </p>
              <h3 className="font-bold text-sm text-[#172033]">1. Uploaded Notes &amp; Data Isolation</h3>
              <p>
                All uploaded PDF notes, text summaries, and lecture documents are isolated strictly to your student account. We do not sell or share your academic notes with third-party advertisers.
              </p>
              <h3 className="font-bold text-sm text-[#172033]">2. AI Model Processing</h3>
              <p>
                Syllabi processed by our server-side AI provider are used exclusively for on-demand synthesis of flashcards, summaries, and practice quizzes.
              </p>
              <h3 className="font-bold text-sm text-[#172033]">3. Right to Deletion &amp; Export</h3>
              <p>
                You retain complete ownership of your academic records. You can download an immediate JSON archive of your study materials or permanently delete your account at any time via Settings.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to <strong>Study Loop</strong> ("Your study, in rhythm"). By using our platform, you agree to these Terms.
              </p>
              <h3 className="font-bold text-sm text-[#172033]">1. Academic Integrity</h3>
              <p>
                Study Loop is an active recall study planner and quiz practice tool designed to reinforce memory retention. Users must comply with their respective universities' and schools' honor codes.
              </p>
              <h3 className="font-bold text-sm text-[#172033]">2. Account Security</h3>
              <p>
                You are responsible for safeguarding your login credentials. Do not share credentials or post confidential examination materials without authorized rights.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
