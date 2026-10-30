import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'ti', name: 'Tigrinya (Tigray)', nativeName: 'ትግርኛ', flag: '🇪🇹' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    // Read saved language from cookie or localStorage
    const saved = localStorage.getItem('ss_selected_language');
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
    const cookieMatch = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (cookieMatch && LANGUAGES.some(l => l.code === cookieMatch[1])) return cookieMatch[1];
    return 'en';
  });

  const dropdownRef = useRef(null);

  // Initialize Google Translate Script
  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,am,om,ti',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger language change for Afaan Oromoo, Amharic, Tigrinya, and English
  const handleSelectLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('ss_selected_language', langCode);
    setIsOpen(false);

    // Set Google Translate cookie across all domain paths
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;

    // Try triggering select element in Google Translate widget if present
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    }

    // Reload page immediately so Google Translate parses and translates whole page
    window.location.reload();
  };

  const activeLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Hidden Google Translate Mount Container */}
      <div id="google_translate_element" style={{ position: 'absolute', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}></div>

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-[#F5F5F4] hover:bg-[#E6EFE9] border border-[#E5E5E3] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1C160F] transition-all shadow-2xs"
        title="Select Language / ቋንቋ ይምረጡ"
      >
        <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="text-[11px] font-semibold">{activeLangObj.flag} {activeLangObj.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#E5E5E3] shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[#E5E5E3]">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              Choose your language
            </p>
          </div>
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentLang === lang.code
                    ? 'bg-[#E6EFE9] text-[#14532D] font-bold'
                    : 'text-slate-700 hover:bg-[#F5F5F4]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">{lang.nativeName}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{lang.name}</span>
                  </div>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
