import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, MapPin, Calendar, Heart, Send, Check, Play, User, Phone, Video, AlertCircle, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PlayerProfile({ currentUser }) {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Demande d'essai modal
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialMessage, setTrialMessage] = useState('');
  const [trialSending, setTrialSending] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);

  const token = localStorage.getItem('scoutini_token');
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  useEffect(() => {
    fetchPlayerProfile();
    if (currentUser && currentUser.role !== 'PLAYER') {
      checkIfFavorited();
    }
  }, [id, currentUser]);

  const fetchPlayerProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/players/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlayer(data.player);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorited = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const found = data.favorites.some(fav => fav.player.id === id);
        setIsFavorited(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      alert(t('loginToFavorite'));
      return;
    }
    if (currentUser.role === 'PLAYER') return;

    setFavoriteLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:5000/api/favorites/${id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSendTrial = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setTrialSending(true);

    try {
      const res = await fetch('http://localhost:5000/api/trials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ playerId: id, message: trialMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrialSuccess(true);
      setTrialMessage('');
      setTimeout(() => {
        setShowTrialModal(false);
        setTrialSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setTrialSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t('playerNotFound')}</h2>
          <p className="text-gray-400 mb-6">{error || t('playerNotFoundDesc')}</p>
          <Link to="/talents" className="bg-primary hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all">
            {t('backToSearch')}
          </Link>
        </div>
      </div>
    );
  }

  // Radar Chart stats mapping
  const stats = player.stats || { speed: 50, technique: 50, endurance: 50, passing: 50, shooting: 50, dribbling: 50, defending: 50, physical: 50 };
  const statKeys = ['speed', 'technique', 'endurance', 'passing', 'shooting', 'dribbling', 'defending', 'physical'];
  const statNames = statKeys.map(key => t('radar_' + key));
  
  // Rayon du radar chart SVG (taille de base 300x300, centre à 150,150, rayon max 100)
  const cx = 150;
  const cy = 150;
  const r = 100;
  
  // Générer les points du polygone de performance
  const points = statKeys.map((key, i) => {
    const val = stats[key] || 50;
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2; // Commencer en haut
    const dist = (val / 100) * r;
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Cercles concentriques (25%, 50%, 75%, 100%)
  const gridCircles = [25, 50, 75, 100].map(pct => {
    const radius = (pct / 100) * r;
    return <circle key={pct} cx={cx} cy={cy} r={radius} className="stroke-white/10 fill-none stroke-dasharray-[2 2]" />;
  });

  // Lignes de séparation (rayons)
  const gridLines = statKeys.map((_, i) => {
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} className="stroke-white/10" />;
  });

  // Positionnement des textes d'étiquettes
  const labels = statNames.map((name, i) => {
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const offset = 18;
    const x = cx + (r + offset) * Math.cos(angle);
    const y = cy + (r + offset) * Math.sin(angle) + 4; // Ajustement vertical
    let textAnchor = "middle";
    if (Math.cos(angle) > 0.1) textAnchor = "start";
    if (Math.cos(angle) < -0.1) textAnchor = "end";

    return (
      <text 
        key={name} 
        x={x} 
        y={y} 
        textAnchor={textAnchor}
        className="fill-gray-400 text-[10px] font-bold uppercase tracking-wider"
      >
        {name}
      </text>
    );
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="bg-pitch-lines"></div>

      <div className="relative z-10 space-y-8">
        
        {/* Entête du Profil */}
        <div className={`glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 ${isRtl ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
          <div className={`flex flex-col md:flex-row items-center gap-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-28 h-28 relative">
              {player.avatar ? (
                <img 
                  src={`http://localhost:5000${player.avatar}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full border-2 border-primary" 
                />
              ) : (
                <div className="w-full h-full bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center text-4xl font-extrabold text-white">
                  {player.firstName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className={`flex flex-col md:flex-row items-center gap-3 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                <h1 className="text-3xl font-extrabold text-white">{player.firstName} {player.lastName}</h1>
                <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {t('pos_' + player.position) || player.position}
                </span>
              </div>
              <p className="text-gray-400 text-lg mt-1 mb-3">{player.currentClub || t('noClub')}</p>
              
              <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {player.city}, {player.region}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {player.dateOfBirth || t('dateNotSpecified')}</span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> 
                  {player.preferredFoot === 'Right' ? t('rightFootLabelLong') : player.preferredFoot === 'Left' ? t('leftFootLabelLong') : t('bothFeetLabelLong')}
                </span>
              </div>
            </div>
          </div>

          {/* Action pour les recruteurs */}
          {currentUser && currentUser.role !== 'PLAYER' && (
            <div className={`flex items-center gap-3 w-full md:w-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                className={`flex-1 md:flex-none py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
                  isFavorited
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? t('inFavorites') : t('addFavorite')}
              </button>

              <button
                onClick={() => setShowTrialModal(true)}
                className="flex-1 md:flex-none bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" /> {t('inviteToTrial')}
              </button>
            </div>
          )}
        </div>

        {/* Corps du Profil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bloc 1: CV Infos et Stats de Match */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Bio */}
            <div className={`glass-panel p-8 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-bold text-white mb-4">{t('bioAndPath')}</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {player.bio || t('noBio')}
              </p>
            </div>

            {/* Mensurations & Détails physiques */}
            <div className={`glass-panel p-8 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-bold text-white mb-6">{t('measurementsTitle')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[#070D14] p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('height')}</p>
                  <p className="text-2xl font-black text-white">{player.height ? `${player.height} cm` : '—'}</p>
                </div>
                <div className="bg-[#070D14] p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('weight')}</p>
                  <p className="text-2xl font-black text-white">{player.weight ? `${player.weight} kg` : '—'}</p>
                </div>
                <div className="bg-[#070D14] p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('preferredFoot')}</p>
                  <p className="text-2xl font-black text-white">
                    {player.preferredFoot === 'Right' ? t('rightFootLabel') : player.preferredFoot === 'Left' ? t('leftFootLabel') : t('bothFeetLabel')}
                  </p>
                </div>
                <div className="bg-[#070D14] p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('nationality')}</p>
                  <p className="text-2xl font-black text-white">{player.nationality}</p>
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div className={`glass-panel p-8 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-bold text-white mb-6">{t('statsOnField')}</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#070D14] p-5 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('matchesPlayed')}</p>
                  <p className="text-3xl font-black text-primary">{stats.matchesPlayed}</p>
                </div>
                <div className="bg-[#070D14] p-5 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('goals')}</p>
                  <p className="text-3xl font-black text-emerald-400">{stats.goals}</p>
                </div>
                <div className="bg-[#070D14] p-5 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('assists')}</p>
                  <p className="text-3xl font-black text-gold">{stats.assists}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bloc 2: Radar de capacités */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-white mb-6 text-center w-full">{t('performanceRadar')}</h3>
            
            {/* SVG Radar Chart */}
            <div className="w-full max-w-[280px] aspect-square relative">
              <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* Grille concentrique */}
                {gridCircles}
                {/* Rayons */}
                {gridLines}
                {/* Polygone de performance */}
                <polygon 
                  points={points} 
                  className="fill-primary/35 stroke-primary stroke-2" 
                />
                {/* Points d'extrémités */}
                {statKeys.map((key, i) => {
                  const val = stats[key] || 50;
                  const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
                  const dist = (val / 100) * r;
                  const x = cx + dist * Math.cos(angle);
                  const y = cy + dist * Math.sin(angle);
                  return <circle key={key} cx={x} cy={y} r="4" className="fill-white stroke-primary stroke-1.5" />;
                })}
                {/* Étiquettes */}
                {labels}
              </svg>
            </div>

            {/* Légende / Valeurs exactes */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6 border-t border-white/5 pt-6 text-sm">
              {statKeys.map((key, i) => (
                <div key={key} className={`flex justify-between items-center text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{statNames[i]}</span>
                  <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded text-xs">{stats[key]}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section Vidéos Highlights */}
        <div className={`glass-panel p-8 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
          <h3 className={`text-xl font-bold text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Video className="text-primary" /> 
            <span>{t('videosHighlightsTitle')} ({player.videos?.length || 0})</span>
          </h3>

          {!player.videos || player.videos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t('noVideos')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {player.videos.map(v => (
                <div key={v.id} className="bg-[#070D14] rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between">
                  <div className="aspect-video relative bg-black flex items-center justify-center">
                    <video 
                      src={`http://localhost:5000${v.videoUrl}`} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded tracking-wide">
                      {t('videoCategory' + v.category) || v.category}
                    </span>
                    <h4 className="font-bold text-white mt-2 mb-1">{v.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal invitation à l'essai */}
      {showTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-8 rounded-3xl relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">{t('invitePlayerTitle').replace('{name}', player.firstName)}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('invitePlayerDesc')}
            </p>

            {trialSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                <Check className="w-10 h-10" />
                <p className="font-bold text-lg">{t('trialSentSuccess')}</p>
                <p className="text-sm text-emerald-400/80">{t('playerNotified')}</p>
              </div>
            ) : (
              <form onSubmit={handleSendTrial} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t('invitationMessage')}</label>
                  <textarea
                    required
                    value={trialMessage}
                    onChange={(e) => setTrialMessage(e.target.value)}
                    rows="5"
                    placeholder={t('invitationPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3.5 px-4 outline-none transition-all duration-300 resize-none font-medium placeholder-gray-500"
                  ></textarea>
                </div>

                <div className={`flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setShowTrialModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={trialSending}
                    className="flex-1 bg-primary hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {trialSending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        {t('sendInvitation')}
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
