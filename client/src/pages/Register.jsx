import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Building, Mail, Lock, UserPlus, AlertCircle, ArrowRight, Calendar, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LegalModals from '../components/common/LegalModals';

export default function Register({ onLoginSuccess }) {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  const [role, setRole] = useState('PLAYER'); // PLAYER, SCOUT, CLUB, ACADEMY
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Info Joueur
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Info Parent (pour les mineurs)
  const [parentName, setParentName] = useState('');
  const [parentNationalId, setParentNationalId] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);

  // Acceptation des termes
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Info Recruteur
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modale CGU / Confidentialité
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState('cgu'); // 'cgu' ou 'privacy'

  // Calculateur d'âge dynamique
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = role === 'PLAYER' && dateOfBirth && calculateAge(dateOfBirth) < 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!termsAccepted) {
      setError(t('validationTermsError'));
      setLoading(false);
      return;
    }

    if (isMinor) {
      if (!parentName || !parentNationalId || !parentPhone || !parentEmail || !parentalConsent) {
        setError(t('validationParentalError'));
        setLoading(false);
        return;
      }
    }

    const payload = {
      email,
      password,
      role,
      ...(role === 'PLAYER' 
        ? { 
            firstName, 
            lastName, 
            dateOfBirth,
            ...(isMinor ? { parentName, parentNationalId, parentPhone, parentEmail, parentalConsent } : {})
          } 
        : { name, organization })
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'registerError');
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
      setError(err.message === 'registerError' ? t('registerError') : err.message);
    } finally {
      setLoading(false);
    }
  };

  const openLegalModal = (type) => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="bg-pitch-lines"></div>

      <div className="glass-panel w-full max-w-2xl p-8 rounded-3xl relative z-10 shadow-2xl bg-[#0d1b2a]/90 border border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">{t('registerTitle')}</h2>
          <p className="text-gray-400">{t('registerSub')}</p>
        </div>

        {/* Sélection du rôle */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { 
              id: 'PLAYER', 
              label: t('player'), 
              desc: t('rolePlayerDesc'), 
              icon: User 
            },
            { 
              id: 'SCOUT', 
              label: t('scout'), 
              desc: t('roleScoutDesc'), 
              icon: Shield 
            },
            { 
              id: 'CLUB', 
              label: t('club'), 
              desc: t('roleClubDesc'), 
              icon: Building 
            },
            { 
              id: 'ACADEMY', 
              label: t('academy'), 
              desc: t('roleAcademyDesc'), 
              icon: Building 
            }
          ].map((r) => {
            const IconComp = r.icon;
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  active 
                    ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' 
                    : 'bg-white/2 border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-300'
                }`}
              >
                <IconComp className={`w-6 h-6 ${active ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <p className="font-bold text-sm">{r.label}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {role === 'PLAYER' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t('firstName')}</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Ahmed"
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 px-4 outline-none transition-all duration-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t('lastName')}</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Ben Said"
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 px-4 outline-none transition-all duration-300 font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    {t('dateOfBirth')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all duration-300 font-medium"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mohamed Gharbi"
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 px-4 outline-none transition-all duration-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t('organization')}</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Ex: Scoutini Pro / EST"
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 px-4 outline-none transition-all duration-300 font-medium"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t('email')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: contact@email.com"
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all duration-300 font-medium placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t('password')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all duration-300 font-medium placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Section consentement parental pour les joueurs mineurs */}
          {isMinor && (
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl space-y-4 animate-fade-in md:col-span-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                {t('parentInfoTitle')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{t('parentName')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Ex: Hedi Cherif"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3.5 outline-none text-sm font-medium focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{t('parentNationalId')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={parentNationalId}
                    onChange={(e) => setParentNationalId(e.target.value)}
                    placeholder="Ex: 08765432"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3.5 outline-none text-sm font-medium focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{t('parentPhone')} <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Ex: +216 98 765 432"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3.5 outline-none text-sm font-medium focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{t('parentEmail')} <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="Ex: parent@email.com"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3.5 outline-none text-sm font-medium focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  id="parentalConsent"
                  required
                  checked={parentalConsent}
                  onChange={(e) => setParentalConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/10 text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label htmlFor="parentalConsent" className="text-xs text-gray-300 leading-normal cursor-pointer select-none">
                  {t('parentalConsentCheck')} <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
          )}

          {/* Checkbox acceptation CGU / Politique de confidentialité */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="termsAccepted"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/10 text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <label htmlFor="termsAccepted" className="text-xs text-gray-300 leading-normal cursor-pointer select-none">
              {t('acceptTermsStart')}
              <button 
                type="button" 
                onClick={() => openLegalModal('cgu')}
                className="text-primary hover:underline font-bold inline-block bg-transparent border-none p-0 cursor-pointer"
              >
                {t('cguLinkText')}
              </button>
              {t('acceptTermsAnd')}
              <button 
                type="button" 
                onClick={() => openLegalModal('privacy')}
                className="text-primary hover:underline font-bold inline-block bg-transparent border-none p-0 cursor-pointer"
              >
                {t('privacyLinkText')}
              </button>
              {t('acceptTermsEnd')}
              <span className="text-red-500"> *</span>
            </label>
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
                {t('registerButton')}
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            {t('loginLink')}
          </Link>
        </p>
      </div>

      {/* Modal légal CGU / Politique de confidentialité */}
      <LegalModals 
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalModalType}
      />
    </div>
  );
}

