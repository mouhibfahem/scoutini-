import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send, Calendar, CheckCircle2, Clock, XCircle, Eye, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ScoutDashboard() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [favorites, setFavorites] = useState([]);
  const [trials, setTrials] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites'); // favorites, trials
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('scoutini_token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [favRes, trialRes] = await Promise.all([
        fetch('http://localhost:5000/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/trials/sent', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const favData = await favRes.json();
      const trialData = await trialRes.json();

      if (favRes.ok) setFavorites(favData.favorites);
      if (trialRes.ok) setTrials(trialData.trials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (playerId) => {
    if (!window.confirm(t('confirmRemoveFavorite'))) return;
    try {
      const res = await fetch(`http://localhost:5000/api/favorites/${playerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFavorites(favorites.filter(fav => fav.player.id !== playerId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="bg-pitch-lines"></div>

      <div className={`relative z-10 space-y-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        
        {/* Entête du tableau de bord */}
        <div className="glass-panel p-8 rounded-3xl">
          <h1 className="text-3xl font-extrabold text-white">{t('scoutDashboardTitle')}</h1>
          <p className="text-gray-400 mt-1">{t('scoutDashboardDesc')}</p>
        </div>

        {/* Sélection des onglets */}
        <div className={`flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all duration-300 ${isRtl ? 'flex-row-reverse' : ''} ${
              activeTab === 'favorites'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>{t('favoritedPlayersTab')} ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('trials')}
            className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all duration-300 ${isRtl ? 'flex-row-reverse' : ''} ${
              activeTab === 'trials'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>{t('trialRequestsTab')} ({trials.length})</span>
          </button>
        </div>

        {/* Onglet 1: Favoris */}
        {activeTab === 'favorites' && (
          <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">{t('mySavedPlayersTitle')}</h2>

            {favorites.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t('noFavoritesDesc')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(fav => {
                  const p = fav.player;
                  return (
                    <div key={fav.id} className="bg-[#070D14] rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between">
                      <div className="p-6">
                        <div className={`flex items-center gap-4 mb-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-14 h-14 bg-primary/20 border border-primary/20 rounded-full flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0">
                            {p.firstName[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-tight">{p.firstName} {p.lastName}</h4>
                            <span className="text-xs text-primary font-bold">{t('pos_' + p.position) || p.position}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 border-t border-white/5 pt-4">
                          <div>
                            <p className="font-bold text-gray-500">{t('cityRegion')}</p>
                            <p className="text-white">{p.city}, {p.region}</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-500">{t('preferredFootLabel')}</p>
                            <p className="text-white">
                              {p.preferredFoot === 'Right' ? t('filterRightFoot') : p.preferredFoot === 'Left' ? t('filterLeftFoot') : t('filterBothFeet')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 bg-white/2 border-t border-white/5 flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Link
                          to={`/players/${p.id}`}
                          className="flex-1 bg-primary hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> {t('viewProfileButton')}
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorite(p.id)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer border border-red-500/15"
                          title={t('removeFavoriteTooltip')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Onglet 2: Demandes d'Essai */}
        {activeTab === 'trials' && (
          <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">{t('trialTrackingTitle')}</h2>

            {trials.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t('noSentTrials')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b border-white/5 text-xs text-gray-500 uppercase font-black ${isRtl ? 'text-right flex-row-reverse' : ''}`}>
                      <th className="py-4">{t('tableHeaderPlayer')}</th>
                      <th className="py-4">{t('tableHeaderPosition')}</th>
                      <th className="py-4">{t('tableHeaderMessage')}</th>
                      <th className="py-4">{t('tableHeaderDate')}</th>
                      <th className="py-4 text-center">{t('tableHeaderStatus')}</th>
                      <th className="py-4 text-center">{t('tableHeaderAction')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trials.map(trial => (
                      <tr key={trial.id} className="border-b border-white/2 text-sm text-gray-300 hover:bg-white/1">
                        <td className="py-4 font-bold text-white">{trial.player.firstName} {trial.player.lastName}</td>
                        <td className="py-4">
                          <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">
                            {t('pos_' + trial.player.position) || trial.player.position}
                          </span>
                        </td>
                        <td className="py-4 max-w-xs truncate" title={trial.message}>{trial.message}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 text-primary" /> 
                            <span>{new Date(trial.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          {trial.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5" /> {t('statusPending')}
                            </span>
                          )}
                          {trial.status === 'ACCEPTED' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {t('statusAccepted')}
                            </span>
                          )}
                          {trial.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/25 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> {t('statusRejected')}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <Link 
                            to={`/players/${trial.player.id}`} 
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-block"
                          >
                            {t('viewProfileButton')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
