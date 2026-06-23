import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'invalidCredentialsError');
      }

      // Sauvegarder dans localStorage
      localStorage.setItem('scoutini_token', data.token);
      
      // Mettre à jour l'état de l'application
      onLoginSuccess(data.user);

      // Redirection selon le rôle
      if (data.user.role === 'PLAYER') {
        navigate('/dashboard');
      } else {
        navigate('/scout-dashboard');
      }
    } catch (err) {
      setError(err.message === 'invalidCredentialsError' || err.message === 'Identifiants incorrects.' ? t('invalidCredentialsError') : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="bg-pitch-lines"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">{t('welcomeBack')}</h2>
          <p className="text-gray-400">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">{t('emailField')}</label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-gray-500`}>
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholderEmail')}
                className={`w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none transition-all duration-300 font-medium placeholder-gray-500`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">{t('passwordField')}</label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-gray-500`}>
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none transition-all duration-300 font-medium placeholder-gray-500`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {t('loginButton')}
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline font-bold">
            {t('signUpFreeLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
