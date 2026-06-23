import React, { useState, useEffect } from 'react';
import { User, Award, Video, FileText, Upload, Plus, Trash2, Check, AlertCircle, Save, Calendar, Shield, ShieldAlert, Mail, Phone, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PlayerDashboard() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState('cv'); // cv, stats, videos, trials
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Demandes d'essais reçues
  const [trials, setTrials] = useState([]);
  const [trialsLoading, setTrialsLoading] = useState(false);

  // CV Form state
  const [cvForm, setCvForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', phone: '',
    city: '', region: '', height: '', weight: '',
    position: 'CM', preferredFoot: 'Right', currentClub: '', bio: ''
  });

  // Stats Form state
  const [statsForm, setStatsForm] = useState({
    speed: 50, technique: 50, endurance: 50, passing: 50,
    shooting: 50, dribbling: 50, defending: 50, physical: 50,
    matchesPlayed: 0, goals: 0, assists: 0
  });

  // Video Form state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoCategory, setVideoCategory] = useState('HIGHLIGHT');
  const [videoFile, setVideoFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);

  const token = localStorage.getItem('scoutini_token');

  // Gouvernorats de Tunisie pour la sélection
  const tunisianRegions = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
    "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba", 
    "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", 
    "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  // Postes de football dynamically translated
  const footballPositions = [
    { id: 'GK', name: t('pos_GK') },
    { id: 'CB', name: t('pos_CB') },
    { id: 'LB', name: t('pos_LB') },
    { id: 'RB', name: t('pos_RB') },
    { id: 'CDM', name: t('pos_CDM') },
    { id: 'CM', name: t('pos_CM') },
    { id: 'CAM', name: t('pos_CAM') },
    { id: 'LW', name: t('pos_LW') },
    { id: 'RW', name: t('pos_RW') },
    { id: 'ST', name: t('pos_ST') }
  ];

  useEffect(() => {
    fetchProfile();
    fetchMyVideos();
    fetchReceivedTrials();
  }, []);

  const fetchReceivedTrials = async () => {
    setTrialsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/trials/received', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTrials(data.trials);
      }
    } catch (err) {
      console.error('Erreur chargement demandes d\'essai:', err);
    } finally {
      setTrialsLoading(false);
    }
  };

  const handleRespondToTrial = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/trials/${id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(status === 'ACCEPTED' ? t('trialAcceptSuccess') : t('trialDeclineSuccess'));
      fetchReceivedTrials();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const p = data.user.playerProfile;
      setPlayer(p);
      
      // Remplir les formulaires
      if (p) {
        setCvForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          dateOfBirth: p.dateOfBirth || '',
          phone: p.phone || '',
          city: p.city || '',
          region: p.region || '',
          height: p.height || '',
          weight: p.weight || '',
          position: p.position || 'CM',
          preferredFoot: p.preferredFoot || 'Right',
          currentClub: p.currentClub || '',
          bio: p.bio || ''
        });

        if (p.stats) {
          setStatsForm({
            speed: p.stats.speed,
            technique: p.stats.technique,
            endurance: p.stats.endurance,
            passing: p.stats.passing,
            shooting: p.stats.shooting,
            dribbling: p.stats.dribbling,
            defending: p.stats.defending,
            physical: p.stats.physical,
            matchesPlayed: p.stats.matchesPlayed,
            goals: p.stats.goals,
            assists: p.stats.assists
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('http://localhost:5000/api/players/avatar', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('avatarSuccess'));
      // Recharger le profil pour rafraîchir l'image
      fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMyVideos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/videos/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCvSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Convertir taille/poids en nombre
    const payload = {
      ...cvForm,
      height: cvForm.height ? parseInt(cvForm.height) : null,
      weight: cvForm.weight ? parseInt(cvForm.weight) : null
    };

    try {
      const res = await fetch('http://localhost:5000/api/players/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('cvSuccess'));
      setPlayer(data.player);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Convertir toutes les valeurs en entier
    const payload = Object.keys(statsForm).reduce((acc, key) => {
      acc[key] = parseInt(statsForm[key]);
      return acc;
    }, {});

    try {
      const res = await fetch('http://localhost:5000/api/players/stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('statsSuccess'));
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError(t('selectVideoFileError'));
      return;
    }
    setError('');
    setSuccess('');
    setVideoLoading(true);

    const formData = new FormData();
    formData.append('title', videoTitle);
    formData.append('description', videoDesc);
    formData.append('category', videoCategory);
    formData.append('video', videoFile);

    try {
      const res = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('videoSuccess'));
      setVideoTitle('');
      setVideoDesc('');
      setVideoFile(null);
      // Reset file input
      document.getElementById('video-file-input').value = '';
      fetchMyVideos();
    } catch (err) {
      setError(err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm(t('deleteVideoConfirm'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('videoDeletedSuccess'));
      fetchMyVideos();
    } catch (err) {
      setError(err.message);
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

      <div className={`flex flex-col lg:flex-row gap-8 relative z-10 ${isRtl ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
        
        {/* Barre latérale - Profil résumé */}
        <div className="w-full lg:w-1/4">
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 group/avatar">
              {player && player.avatar ? (
                <img 
                  src={`http://localhost:5000${player.avatar}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full border-2 border-primary" 
                />
              ) : (
                <div className="w-full h-full bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center text-3xl font-black text-white">
                  {cvForm.firstName ? cvForm.firstName[0].toUpperCase() : 'J'}
                </div>
              )}
              {/* Overlay pour uploader la photo */}
              <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs font-bold text-white">
                <Upload className="w-5 h-5 mb-1" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            <h3 className="text-xl font-bold text-white">
              {cvForm.firstName} {cvForm.lastName}
            </h3>
            <p className="text-sm text-primary font-semibold mb-2">
              {footballPositions.find(p => p.id === cvForm.position)?.name || cvForm.position}
            </p>
            <p className="text-xs text-gray-400">
              {cvForm.city ? `${cvForm.city}, ` : ''}{cvForm.region || t('tunisia')}
            </p>

            <div className="border-t border-white/5 mt-6 pt-6 flex flex-col gap-3">
              {[
                { 
                  id: 'cv', 
                  label: t('myFootballCV'), 
                  icon: FileText 
                },
                { 
                  id: 'stats', 
                  label: t('myStatistics'), 
                  icon: Award 
                },
                { 
                  id: 'videos', 
                  label: t('highlightVideos'), 
                  icon: Video 
                },
                { 
                  id: 'trials', 
                  label: `${t('trialRequests')} (${trials.length})`, 
                  icon: Calendar 
                }
              ].map(tab => {
                const IconComp = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError('');
                      setSuccess('');
                    }}
                    className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-semibold transition-all duration-300 cursor-pointer ${isRtl ? 'flex-row-reverse' : ''} ${
                      active 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                        : 'bg-white/2 hover:bg-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal de l'onglet */}
        <div className="w-full lg:w-3/4">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Onglet 1: CV FOOTBALL */}
          {activeTab === 'cv' && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className={`text-2xl font-bold text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <FileText className="text-primary" /> 
                <span>{t('cvInfoTitle')}</span>
              </h2>

              <form onSubmit={handleCvSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('firstNameLabel')}</label>
                    <input
                      type="text"
                      required
                      value={cvForm.firstName}
                      onChange={(e) => setCvForm({ ...cvForm, firstName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('lastNameLabel')}</label>
                    <input
                      type="text"
                      required
                      value={cvForm.lastName}
                      onChange={(e) => setCvForm({ ...cvForm, lastName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dobLabel')}</label>
                    <input
                      type="date"
                      value={cvForm.dateOfBirth}
                      onChange={(e) => setCvForm({ ...cvForm, dateOfBirth: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('regionLabel')}</label>
                    <select
                      value={cvForm.region}
                      onChange={(e) => setCvForm({ ...cvForm, region: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 cursor-pointer"
                    >
                      <option value="">{t('selectOption')}</option>
                      {tunisianRegions.map(reg => (
                        <option key={reg} value={reg} className="bg-slate-900">{reg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('cityLabel')}</label>
                    <input
                      type="text"
                      value={cvForm.city}
                      onChange={(e) => setCvForm({ ...cvForm, city: e.target.value })}
                      placeholder={t('cityPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('heightLabel')}</label>
                    <input
                      type="number"
                      value={cvForm.height}
                      onChange={(e) => setCvForm({ ...cvForm, height: e.target.value })}
                      placeholder={t('heightPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('weightLabel')}</label>
                    <input
                      type="number"
                      value={cvForm.weight}
                      onChange={(e) => setCvForm({ ...cvForm, weight: e.target.value })}
                      placeholder={t('weightPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('favPositionLabel')}</label>
                    <select
                      value={cvForm.position}
                      onChange={(e) => setCvForm({ ...cvForm, position: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 cursor-pointer"
                    >
                      {footballPositions.map(pos => (
                        <option key={pos.id} value={pos.id} className="bg-slate-900">{pos.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('preferredFootLabel')}</label>
                    <select
                      value={cvForm.preferredFoot}
                      onChange={(e) => setCvForm({ ...cvForm, preferredFoot: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 cursor-pointer"
                    >
                      <option value="Right" className="bg-slate-900">{t('filterRightFoot')}</option>
                      <option value="Left" className="bg-slate-900">{t('filterLeftFoot')}</option>
                      <option value="Both" className="bg-slate-900">{t('filterBothFeet')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('currentClubLabel')}</label>
                    <input
                      type="text"
                      value={cvForm.currentClub}
                      onChange={(e) => setCvForm({ ...cvForm, currentClub: e.target.value })}
                      placeholder={t('currentClubPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('contactPhoneLabel')}</label>
                    <input
                      type="tel"
                      value={cvForm.phone}
                      onChange={(e) => setCvForm({ ...cvForm, phone: e.target.value })}
                      placeholder={t('contactPhonePlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{t('careerBioLabel')}</label>
                  <textarea
                    value={cvForm.bio}
                    onChange={(e) => setCvForm({ ...cvForm, bio: e.target.value })}
                    rows="4"
                    placeholder={t('careerBioPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center gap-2 cursor-pointer ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                >
                  <Save className="w-5 h-5" /> {t('saveCVButton')}
                </button>
              </form>
            </div>
          )}

          {/* Onglet 2: STATISTIQUES */}
          {activeTab === 'stats' && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className={`text-2xl font-bold text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Award className="text-primary" /> 
                <span>{t('skillsAndMatchesTitle')}</span>
              </h2>

              <form onSubmit={handleStatsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Slider de capacités */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 mb-4">{t('physicalTechnicalTitle')}</h3>
                    
                    {[
                      { key: 'speed', label: t('radar_speed') },
                      { key: 'technique', label: t('radar_technique') },
                      { key: 'endurance', label: t('radar_endurance') },
                      { key: 'passing', label: t('radar_passing') }
                    ].map(stat => (
                      <div key={stat.key}>
                        <div className={`flex justify-between text-sm font-semibold mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-gray-300">{stat.label}</span>
                          <span className="text-primary">{statsForm[stat.key]} / 100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={statsForm[stat.key]}
                          onChange={(e) => setStatsForm({ ...statsForm, [stat.key]: e.target.value })}
                          className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 mb-4">{t('attackingDefendingTitle')}</h3>

                    {[
                      { key: 'shooting', label: t('radar_shooting') },
                      { key: 'dribbling', label: t('radar_dribbling') },
                      { key: 'defending', label: t('radar_defending') },
                      { key: 'physical', label: t('radar_physical') }
                    ].map(stat => (
                      <div key={stat.key}>
                        <div className={`flex justify-between text-sm font-semibold mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-gray-300">{stat.label}</span>
                          <span className="text-primary">{statsForm[stat.key]} / 100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={statsForm[stat.key]}
                          onChange={(e) => setStatsForm({ ...statsForm, [stat.key]: e.target.value })}
                          className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                </div>

                {/* Données de match */}
                <div className="border-t border-white/5 pt-6 mt-8">
                  <h3 className="text-lg font-bold text-white mb-4">{t('matchStatsTitle')}</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t('matchesPlayedLabel')}</label>
                      <input
                        type="number"
                        min="0"
                        value={statsForm.matchesPlayed}
                        onChange={(e) => setStatsForm({ ...statsForm, matchesPlayed: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t('goalsScoredLabel')}</label>
                      <input
                        type="number"
                        min="0"
                        value={statsForm.goals}
                        onChange={(e) => setStatsForm({ ...statsForm, goals: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t('assistsLabel')}</label>
                      <input
                        type="number"
                        min="0"
                        value={statsForm.assists}
                        onChange={(e) => setStatsForm({ ...statsForm, assists: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center gap-2 cursor-pointer ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                >
                  <Save className="w-5 h-5" /> {t('updateStatsButton')}
                </button>
              </form>
            </div>
          )}

          {/* Onglet 3: VIDEOS HIGHLIGHTS */}
          {activeTab === 'videos' && (
            <div className="space-y-8">
              
              {/* Formulaire upload */}
              <div className="glass-panel p-8 rounded-3xl">
                <h2 className={`text-2xl font-bold text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Upload className="text-primary" /> 
                  <span>{t('publishHighlightTitle')}</span>
                </h2>

                <form onSubmit={handleVideoUpload} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t('videoTitleLabel')}</label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder={t('videoTitlePlaceholder')}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t('videoCategoryLabel')}</label>
                      <select
                        value={videoCategory}
                        onChange={(e) => setVideoCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 cursor-pointer"
                      >
                        <option value="HIGHLIGHT" className="bg-slate-900">{t('videoCategoryHIGHLIGHT')}</option>
                        <option value="MATCH" className="bg-slate-900">{t('videoCategoryMATCH')}</option>
                        <option value="TRAINING" className="bg-slate-900">{t('videoCategoryTRAINING')}</option>
                        <option value="SKILLS" className="bg-slate-900">{t('videoCategorySKILLS')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('videoDescLabel')}</label>
                    <textarea
                      value={videoDesc}
                      onChange={(e) => setVideoDesc(e.target.value)}
                      rows="2"
                      placeholder={t('videoDescPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 px-4 outline-none transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">{t('videoFileLabel')}</label>
                    <input
                      id="video-file-input"
                      type="file"
                      required
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={videoLoading}
                    className={`bg-primary hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center gap-2 cursor-pointer ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                  >
                    {videoLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" /> {t('publishVideoButton')}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Liste des vidéos existantes */}
              <div className="glass-panel p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6">{t('myPublishedVideos')} ({videos.length})</h2>
                
                {videos.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">{t('noVideosPublished')}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map(v => (
                      <div key={v.id} className="bg-[#070D14] rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between">
                        <div className="aspect-video relative bg-black flex items-center justify-center">
                          <video 
                            src={`http://localhost:5000${v.videoUrl}`} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className={`p-4 flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <div>
                            <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded tracking-wide">
                              {t('videoCategory' + v.category) || v.category}
                            </span>
                            <h4 className="font-bold text-white mt-2 mb-1">{v.title}</h4>
                            <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteVideo(v.id)}
                            className="text-red-400 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                            title={t('cancel')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'trials' && (
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-3xl">
                <h2 className={`text-2xl font-bold text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="text-primary" /> 
                  <span>{t('receivedTrialsTitle')}</span>
                </h2>

                {trialsLoading ? (
                  <div className="flex justify-center py-10">
                    <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : trials.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">
                    {t('noReceivedTrials')}
                  </p>
                ) : (
                  <div className="space-y-6">
                    {trials.map(tData => {
                      const scout = tData.from.scoutProfile;
                      const scoutName = scout ? scout.name : t('scout');
                      const scoutOrg = scout ? scout.organization : '';
                      const isVerified = scout ? scout.verified : false;
                      const avatar = scout ? scout.avatar : null;

                      return (
                        <div key={tData.id} className={`bg-white/2 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start justify-between ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                          <div className={`flex items-start gap-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <div className="relative flex-shrink-0">
                              {avatar ? (
                                <img src={`http://localhost:5000${avatar}`} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-primary/30" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-white">
                                  {scoutName[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className={`flex items-center gap-2 flex-wrap mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <h4 className="text-base font-bold text-white">{scoutName}</h4>
                                {isVerified && (
                                  <span 
                                    className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                    title={t('scoutVerifiedLabel')}
                                  >
                                    <Check className="w-2.5 h-2.5" /> 
                                    <span>{t('scoutVerifiedLabel')}</span>
                                  </span>
                                )}
                              </div>
                              {scoutOrg && <p className="text-xs text-gray-400 font-semibold mb-2">{scoutOrg}</p>}
                              
                              <div className="bg-white/2 border border-white/5 p-4 rounded-xl mt-3 text-sm text-gray-300">
                                <p className="italic">"{tData.message || t('noPresentationMessage')}"</p>
                              </div>

                              <div className={`flex items-center gap-4 mt-3 text-xs text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(tData.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {tData.from.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons / Status */}
                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0 self-stretch md:self-auto justify-end">
                            {tData.status === 'PENDING' ? (
                              <>
                                <button 
                                  onClick={() => handleRespondToTrial(tData.id, 'ACCEPTED')}
                                  className="flex-grow md:flex-grow-0 px-4 py-2 bg-primary hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-lg shadow-primary/10"
                                >
                                  <Check className="w-3.5 h-3.5" /> 
                                  <span>{t('trialAcceptButton')}</span>
                                </button>
                                <button 
                                  onClick={() => handleRespondToTrial(tData.id, 'REJECTED')}
                                  className="flex-grow md:flex-grow-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 border border-red-500/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> 
                                  <span>{t('trialDeclineButton')}</span>
                                </button>
                              </>
                            ) : (
                              <div className="text-center w-full">
                                <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold ${
                                  tData.status === 'ACCEPTED' 
                                    ? 'bg-primary/20 text-primary border border-primary/30' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {tData.status === 'ACCEPTED' ? t('trialAcceptedLabel') : t('trialDeclinedLabel')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
