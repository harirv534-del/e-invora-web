import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoHome: () => void;
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl text-xs bg-[#29221F] border border-[#D4B477]/30 text-white focus:outline-none focus:border-[#D4B477]';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onGoHome }) => {
  const [status, setStatus] = useState<{ configured: boolean; setupAvailable: boolean } | null>(null);
  const [statusError, setStatusError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAdminStatus()
      .then(setStatus)
      .catch((e) => setStatusError(e.message || 'Could not reach the server.'));
  }, []);

  const needsSetup = status !== null && !status.configured;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (needsSetup && password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (needsSetup) {
        await api.adminSetup(setupKey, email.trim(), password);
      } else {
        await api.adminLogin(email.trim(), password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#29221F] text-[#F8F3EA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1F1917] rounded-3xl p-8 border border-[#D4B477]/40 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#6E2639] border border-[#D4B477]/50 flex items-center justify-center mx-auto text-[#D4B477]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">E-INVORA</h1>
          <p className="text-xs text-[#D4B477] uppercase font-semibold tracking-widest font-sans">
            {needsSetup ? 'Owner Account Setup' : 'Owner Sign In'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#29221F] border border-[#D4B477]/25 text-[11px] text-[#F8F3EA]/70 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>This area is only for the business owner. Public registration is not available.</span>
        </div>

        {statusError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{statusError} Make sure the server is running (see README).</span>
          </div>
        )}

        {status && needsSetup && !status.setupAvailable && (
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-100 text-xs">
            The owner account is not set up and setup is switched off on this server. Add{' '}
            <code>OWNER_SETUP_KEY</code> (16+ characters) to the server settings, restart, and come back here.
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status && !(needsSetup && !status.setupAvailable) && (
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {needsSetup && (
              <div>
                <label className="text-xs font-semibold text-[#D4B477] block mb-1">Setup key</label>
                <input
                  type="password"
                  required
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className={inputClass}
                  autoComplete="off"
                />
                <p className="text-[10px] text-[#F8F3EA]/50 mt-1">
                  Shown once in the server terminal window, or the OWNER_SETUP_KEY value in your .env file.
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-[#D4B477] block mb-1">Owner email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                {needsSetup ? 'Choose a password (12+ characters)' : 'Password'}
              </label>
              <input
                type="password"
                required
                minLength={needsSetup ? 12 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoComplete={needsSetup ? 'new-password' : 'current-password'}
              />
            </div>
            {needsSetup && (
              <div>
                <label className="text-xs font-semibold text-[#D4B477] block mb-1">Repeat password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{needsSetup ? 'Create Owner Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4B477]" />
                </>
              )}
            </button>
          </form>
        )}

        {!status && !statusError && <p className="text-center text-xs text-[#F8F3EA]/60">Checking server...</p>}

        <div className="text-center pt-2">
          <button
            onClick={onGoHome}
            className="text-xs text-[#D4B477]/70 hover:text-[#D4B477] underline cursor-pointer"
          >
            ← Back to website
          </button>
        </div>
      </div>
    </div>
  );
};
