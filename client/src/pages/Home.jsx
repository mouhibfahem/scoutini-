import React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserCheck, Video, Award, ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home({ currentUser }) {
  const { t } = useLanguage();

  // Déterminer le lien de destination et le texte du bouton d'action principale
  let ctaLink = "/register";
  let ctaText = t("ctaCreateCV");

  if (currentUser) {
    if (currentUser.role === 'PLAYER') {
      ctaLink = "/dashboard";
      ctaText = t("ctaManageCV");
    } else {
      ctaLink = "/scout-dashboard";
      ctaText = t("ctaDashboard");
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Grid Pitch lines */}
      <div className="bg-pitch-lines"></div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {t("homePromo")}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          {t("homeHeroStart")} <br />
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            {t("homeHeroGreen")}
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("homeHeroDesc")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={ctaLink}
            className="w-full sm:w-auto bg-primary hover:bg-emerald-600 text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {ctaText}
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <Link
            to="/talents"
            className="w-full sm:w-auto glass-card hover:bg-white/5 text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5 text-primary" />
            {t("homeSearchTalents")}
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16 relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12">
          {t("homeWhyUse").split("Scoutini")[0]}
          <span className="text-primary">Scoutini</span>
          {t("homeWhyUse").split("Scoutini")[1]}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl">
            <div className="bg-primary/10 border border-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t("homeFeature1Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("homeFeature1Desc")}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="bg-primary/10 border border-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t("homeFeature2Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("homeFeature2Desc")}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="bg-primary/10 border border-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t("homeFeature3Title")}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t("homeFeature3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Section Tunisie */}
      <section className="bg-white/2 backdrop-blur-md border-y border-white/5 py-20 relative z-10">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              {t("homeSectionTitle")}
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {t("homeSectionDesc")}
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg mt-0.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t("homeSectionPoint1Title")}</h4>
                  <p className="text-sm text-gray-400">{t("homeSectionPoint1Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg mt-0.5">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t("homeSectionPoint2Title")}</h4>
                  <p className="text-sm text-gray-400">{t("homeSectionPoint2Desc")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="glass-card p-6 rounded-3xl relative z-10 border border-white/10">
              <div className="aspect-video bg-[#070D14] rounded-2xl flex items-center justify-center group cursor-pointer border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <span className="text-xs uppercase bg-primary text-white font-bold tracking-widest px-2 py-1 rounded w-fit mb-2">HIGHLIGHTS</span>
                  <h3 className="text-lg font-bold text-white">Ahmed Ben Said — Attaquant (EST Jeunes)</h3>
                  <p className="text-xs text-gray-400">Tunis | 17 ans</p>
                </div>
                <div className="bg-primary hover:bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-gray-500 text-sm">
        <p>{t("homeFooter")}</p>
      </footer>
    </div>
  );
}
