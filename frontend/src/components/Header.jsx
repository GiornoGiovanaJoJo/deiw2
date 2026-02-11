import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { publicApi } from "@/api/public";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import '../pages/Home.css'; // Ensure styles are available

export default function Header() {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Fetch Logo
    useEffect(() => {
        const loadLogo = async () => {
            try {
                const heroData = await publicApi.getContent('home_hero');
                if (heroData?.content?.logo) {
                    setLogoUrl(heroData.content.logo);
                }
            } catch (err) {
                console.error("Failed to load logo", err);
            }
        };
        loadLogo();
    }, []);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            // If not on home page, navigate to home then scroll (via hash)
            navigate(`/#${id}`);
            return;
        }

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    // Handle hash navigation if arriving from another page
    useEffect(() => {
        if (location.pathname === '/' && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header__inner">
                    <Link to="/" className="header__logo flex items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Empire Premium" className="h-10 object-contain" />
                        ) : (
                            <>
                                <span className="header__logo-abbr">EP</span>
                                Empire <span>Premium</span>
                            </>
                        )}
                    </Link>

                    <nav className="nav hidden lg:flex items-center gap-6">
                        <button onClick={() => scrollToSection('about')} className="nav__link">{t('nav.about')}</button>
                        <button onClick={() => scrollToSection('services')} className="nav__link">{t('nav.services')}</button>
                        <button onClick={() => scrollToSection('projects')} className="nav__link">{t('nav.projects')}</button>
                        <LanguageSwitcher />
                    </nav>

                    <div className="header__cta">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="text-sm font-medium hover:text-primary">
                                    {user.first_name || t('nav.profile')}
                                </Link>
                                <Button onClick={logout} variant="ghost" size="sm">
                                    {t('nav.logout')}
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn--gold">
                                {t('nav.login')}
                            </Link>
                        )}
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--outline-purple hidden sm:flex">
                            {t('nav.request')} <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--outline-purple sm:hidden p-2">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button className="hamburger lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl z-[1001] transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <span className="font-bold text-lg">{t('nav.menu')}</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2">
                        <div className="mb-4">
                            <LanguageSwitcher className="w-full justify-start" />
                        </div>
                        <button onClick={() => scrollToSection('about')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">{t('nav.about')}</button>
                        <button onClick={() => scrollToSection('services')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">{t('nav.services')}</button>
                        <button onClick={() => scrollToSection('projects')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">{t('nav.projects')}</button>
                    </nav>

                    <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50">
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-center w-full py-3 px-4 bg-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-purple-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('nav.profile')}
                                </Link>
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="w-full py-3 px-4 text-slate-600 font-medium hover:text-red-500 transition-colors"
                                >
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center w-full py-3 px-4 bg-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-purple-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.login')}
                            </Link>
                        )}
                        <button
                            onClick={() => scrollToSection('footer-form')}
                            className="w-full py-3 px-4 border-2 border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {t('nav.request')} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
