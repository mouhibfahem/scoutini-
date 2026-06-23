import React, { useEffect } from 'react';
import { X, Shield, FileText, Scale } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LegalModals({ isOpen, onClose, type }) {
  const { t, language } = useLanguage();

  // Bloquer le défilement de l'arrière-plan quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isRtl = language === 'ar';

  const title = type === 'cgu' ? t('cguLinkText') : t('privacyLinkText');
  const icon = type === 'cgu' ? (
    <Scale className="w-8 h-8 text-primary" />
  ) : (
    <Shield className="w-8 h-8 text-primary" />
  );
  const contentHtml = type === 'cgu' ? t('cguContent') : t('privacyContent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl relative z-10 shadow-2xl flex flex-col overflow-hidden border border-white/10 bg-[#0d1b2a]/95">
        
        {/* Header */}
        <div className={`p-6 border-b border-white/5 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {icon}
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className={`p-6 overflow-y-auto text-gray-300 space-y-4 text-sm font-medium leading-relaxed legal-content select-text ${isRtl ? 'text-right' : 'text-left'}`}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Footer */}
        <div className={`p-6 border-t border-white/5 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-primary hover:bg-emerald-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/20"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}
