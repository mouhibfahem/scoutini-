import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Award, SlidersHorizontal, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SearchTalents() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [region, setRegion] = useState('');
  const [foot, setFoot] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Gouvernorats de Tunisie
  const tunisianRegions = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
    "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba", 
    "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", 
    "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  // Positions dynamically translated
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
    fetchPlayers(1);
  }, [position, region, foot]); // Déclencher au changement de filtre

  const fetchPlayers = async (page = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/players?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (position) url += `&position=${encodeURIComponent(position)}`;
      if (region) url += `&region=${encodeURIComponent(region)}`;
      if (foot) url += `&foot=${encodeURIComponent(foot)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPlayers(data.players);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlayers(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setPosition('');
    setRegion('');
    setFoot('');
    // Forcer le rechargement
    setTimeout(() => fetchPlayers(1), 50);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="bg-pitch-lines"></div>

      <div className="relative z-10 space-y-8">
        
        {/* Entête */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-3">{t('searchTitle')}</h1>
          <p className="text-gray-400">{t('searchSubtitle')}</p>
        </div>

        {/* Barre de Recherche & Filtres */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <form onSubmit={handleSearchSubmit} className={`flex flex-col md:flex-row gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-gray-500`}>
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholderName')}
                className={`w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 text-white rounded-xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none transition-all duration-300 font-medium`}
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 cursor-pointer shadow-lg"
            >
              {t('searchButton')}
            </button>
          </form>

          {/* Filtres de sélection */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-white/5 pt-4">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('filterPosition')}</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-2.5 px-3 outline-none cursor-pointer text-sm"
              >
                <option value="" className="bg-slate-900">{t('filterAllPositions')}</option>
                {footballPositions.map(pos => (
                  <option key={pos.id} value={pos.id} className="bg-slate-900">{pos.name}</option>
                ))}
              </select>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('filterRegion')}</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-2.5 px-3 outline-none cursor-pointer text-sm"
              >
                <option value="" className="bg-slate-900">{t('filterAllTunisia')}</option>
                {tunisianRegions.map(reg => (
                  <option key={reg} value={reg} className="bg-slate-900">{reg}</option>
                ))}
              </select>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('filterFoot')}</label>
              <select
                value={foot}
                onChange={(e) => setFoot(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-white rounded-xl py-2.5 px-3 outline-none cursor-pointer text-sm"
              >
                <option value="" className="bg-slate-900">{t('filterAll')}</option>
                <option value="Right" className="bg-slate-900">{t('filterRightFoot')}</option>
                <option value="Left" className="bg-slate-900">{t('filterLeftFoot')}</option>
                <option value="Both" className="bg-slate-900">{t('filterBothFeet')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-sm"
              >
                {t('resetFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des Joueurs */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <SlidersHorizontal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">{t('noPlayersFound')}</h3>
            <p className="text-gray-400">{t('noPlayersFoundDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map(p => (
              <div key={p.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="p-6 text-center">
                  <div className="w-20 h-20 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mx-auto mb-4">
                    {p.firstName[0].toUpperCase()}
                  </div>
                  
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    {p.position}
                  </span>

                  <h3 className="text-lg font-bold text-white mt-3 mb-1 truncate">{p.firstName} {p.lastName}</h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4 truncate">
                    {p.currentClub || t('freeAgent')}
                  </p>

                  <div className={`flex flex-col gap-2 text-xs text-gray-400 border-t border-white/5 pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}><MapPin className="w-3.5 h-3.5 text-primary" /> {p.city}, {p.region}</span>
                    <span className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Award className="w-3.5 h-3.5 text-primary" /> 
                      {t('statSpeed')}: {p.stats?.speed || 50} | {t('statTechnique')}: {p.stats?.technique || 50}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/2 border-t border-white/5">
                  <Link
                    to={`/players/${p.id}`}
                    className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    {t('viewCV')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => fetchPlayers(page)}
                className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                  pagination.page === page
                    ? 'bg-primary text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
