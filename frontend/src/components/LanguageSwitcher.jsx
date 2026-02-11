import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher({ className, showLabel = true, inline = false }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];

    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full justify-between"
            >
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {showLabel && <span>{currentLang.name}</span>}
                </div>
                {inline && <span className="transform transition-transform duration-200">{isOpen ? '▲' : '▼'}</span>}
            </Button>

            {isOpen && (
                <>
                    {!inline && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                    )}
                    <div className={inline
                        ? "mt-2 w-full bg-slate-50 rounded-md py-1 space-y-1"
                        : "absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1"
                    }>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`
                                    w-full text-left px-4 py-2 text-sm flex items-center justify-between
                                    hover:bg-gray-100 transition-colors
                                    ${i18n.language === lang.code ? 'text-indigo-600 font-medium' : 'text-gray-700'}
                                    ${inline ? 'pl-8' : ''}
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-base">{lang.flag}</span>
                                    {lang.name}
                                </span>
                                {i18n.language === lang.code && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
