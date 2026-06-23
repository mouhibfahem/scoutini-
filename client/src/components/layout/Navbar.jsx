import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Search, Shield, Video, Award, Heart, Menu, X } from 'lucide-react';
import soccerBall from '../../assets/soccer_ball.png';
import scoutiniLogo from '../../assets/scoutini_logo.png';
import { useLanguage } from '../../contexts/LanguageContext';

/* ── SVG Flag Components ── */
const FlagFrance = ({ size = 18 }) => (
  <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 900 600" style={{ borderRadius: 3, flexShrink: 0 }}>
    <rect width="300" height="600" fill="#002395"/>
    <rect x="300" width="300" height="600" fill="#FFFFFF"/>
    <rect x="600" width="300" height="600" fill="#ED2939"/>
  </svg>
);

const FlagTunisia = ({ size = 18 }) => (
  <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 30 20" style={{ borderRadius: 3, flexShrink: 0 }}>
    {/* Red background */}
    <rect width="30" height="20" fill="#E70013"/>
    {/* White disk */}
    <circle cx="15" cy="10" r="6" fill="#FFF"/>
    {/* Red crescent: outer red circle slightly left */}
    <circle cx="14.5" cy="10" r="4.2" fill="#E70013"/>
    {/* White cutout shifted right to form crescent opening */}
    <circle cx="15.8" cy="10" r="3.4" fill="#FFF"/>
    {/* Red five-pointed star in the crescent opening */}
    <polygon fill="#E70013" points="15.5,8.2 15.9,9.4 17.2,9.4 16.2,10.2 16.6,11.5 15.5,10.7 14.4,11.5 14.8,10.2 13.8,9.4 15.1,9.4"/>
  </svg>
);

const FlagUK = ({ size = 18 }) => (
  <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 60 30" style={{ borderRadius: 3, flexShrink: 0 }}>
    <clipPath id="uk"><rect width="60" height="30"/></clipPath>
    <g clipPath="url(#uk)">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk)"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const getRoleLabel = (role) => {
    if (role === 'PLAYER') return t('player');
    if (role === 'SCOUT') return t('scout');
    if (role === 'CLUB') return t('club');
    if (role === 'ACADEMY') return t('academy');
    return role;
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group" dir="ltr" style={{ direction: 'ltr' }}>
          <span className="text-2xl font-black tracking-wider text-white flex items-center gap-0.5" style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
            SC
            <img 
              src={soccerBall} 
              alt="O" 
              className="w-6.5 h-6.5 object-contain group-hover:rotate-360 transition-all duration-700 mx-0.5 rounded-full" 
            />
            UT<span className="text-primary group-hover:text-emerald-400 transition-colors">INI</span>
          </span>
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
            TN
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/talents" className="text-gray-300 hover:text-white flex items-center gap-1.5 font-medium transition-colors">
            <Search className="w-4.5 h-4.5 text-primary" />
            {t("discover")}
          </Link>

          {user ? (
            <>
              {user.role === 'PLAYER' ? (
                <Link to="/dashboard" className="text-gray-300 hover:text-white flex items-center gap-1.5 font-medium transition-colors">
                  <User className="w-4.5 h-4.5 text-primary" />
                  {t("myProfile")}
                </Link>
              ) : (
                <Link to="/scout-dashboard" className="text-gray-300 hover:text-white flex items-center gap-1.5 font-medium transition-colors">
                  <Heart className="w-4.5 h-4.5 text-primary" />
                  {t("dashboard")}
                </Link>
              )}

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {getRoleLabel(user.role)}
                  </p>
                  <p className="text-sm font-medium text-white max-w-[150px] truncate">
                    {user.email}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    onLogout();
                    navigate('/');
                  }}
                  className="bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/30 p-2 rounded-lg transition-all duration-300 cursor-pointer"
                  title={t("logout")}
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white px-4 py-2 font-medium transition-colors"
              >
                {t("login")}
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {t("join")}
              </Link>
            </div>
          )}
        </div>

        {/* Right side Actions (Language Switcher + Mobile Menu Toggle) */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 p-0.5 rounded-xl">
            <button 
              onClick={() => setLanguage('fr')} 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 cursor-pointer ${
                language === 'fr' 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Français"
            >
              <FlagFrance size={16} />
              <span>FR</span>
            </button>
            
            <button 
              onClick={() => setLanguage('ar')} 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 cursor-pointer ${
                language === 'ar' 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="العربية"
            >
              <FlagTunisia size={16} />
              <span>AR</span>
            </button>

            <button 
              onClick={() => setLanguage('en')} 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 cursor-pointer ${
                language === 'en' 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="English"
            >
              <FlagUK size={16} />
              <span>EN</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-300 hover:text-white p-1 outline-none transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          <Link 
            to="/talents" 
            onClick={closeMenu}
            className="text-gray-300 hover:text-white flex items-center gap-2 py-2 px-3 hover:bg-white/5 rounded-xl transition-all"
          >
            <Search className="w-5 h-5 text-primary" />
            {t("discover")}
          </Link>

          {user ? (
            <>
              {user.role === 'PLAYER' ? (
                <Link 
                  to="/dashboard" 
                  onClick={closeMenu}
                  className="text-gray-300 hover:text-white flex items-center gap-2 py-2 px-3 hover:bg-white/5 rounded-xl transition-all"
                >
                  <User className="w-5 h-5 text-primary" />
                  {t("myProfile")}
                </Link>
              ) : (
                <Link 
                  to="/scout-dashboard" 
                  onClick={closeMenu}
                  className="text-gray-300 hover:text-white flex items-center gap-2 py-2 px-3 hover:bg-white/5 rounded-xl transition-all"
                >
                  <Heart className="w-5 h-5 text-primary" />
                  {t("dashboard")}
                </Link>
              )}

              <div className="border-t border-white/5 my-1" />

              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {getRoleLabel(user.role)}
                  </p>
                  <p className="text-sm font-semibold text-white max-w-[200px] truncate">
                    {user.email}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    onLogout();
                    closeMenu();
                    navigate('/');
                  }}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  {t("logout")}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5 px-3">
              <Link 
                to="/login" 
                onClick={closeMenu}
                className="w-full text-center text-gray-300 hover:text-white border border-white/10 py-3 rounded-xl hover:bg-white/5 font-semibold transition-all"
              >
                {t("login")}
              </Link>
              <Link 
                to="/register" 
                onClick={closeMenu}
                className="w-full text-center bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                {t("join")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
