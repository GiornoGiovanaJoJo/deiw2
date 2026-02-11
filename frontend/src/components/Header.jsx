import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import '../pages/Home.css'; // Ensure styles are available

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
                    <Link to="/" className="header__logo">
                        <span className="header__logo-abbr">EP</span>
                        Empire <span>Premium</span>
                    </Link>

                    <nav className="nav hidden lg:flex">
                        <button onClick={() => scrollToSection('about')} className="nav__link">О нас</button>
                        <button onClick={() => scrollToSection('services')} className="nav__link">Услуги</button>
                        <button onClick={() => scrollToSection('projects')} className="nav__link">Проекты</button>
                        <button onClick={() => scrollToSection('contact')} className="nav__link">Карьера</button>
                    </nav>

                    <div className="header__cta">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="text-sm font-medium hover:text-primary">
                                    {user.first_name || "Профиль"}
                                </Link>
                                <Button onClick={logout} variant="ghost" size="sm">
                                    Выйти
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn--gold">
                                Войти
                            </Link>
                        )}
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--outline-purple hidden sm:flex">
                            Оставить заявку <ArrowRight className="w-4 h-4 ml-2" />
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
                        <span className="font-bold text-lg">Меню</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2">
                        <button onClick={() => scrollToSection('about')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">О нас</button>
                        <button onClick={() => scrollToSection('services')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">Услуги</button>
                        <button onClick={() => scrollToSection('projects')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">Проекты</button>
                        <button onClick={() => scrollToSection('contact')} className="text-left py-3 px-4 rounded-lg hover:bg-slate-50 font-medium text-slate-900">Карьера</button>
                    </nav>

                    <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50">
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-center w-full py-3 px-4 bg-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-purple-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Профиль
                                </Link>
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="w-full py-3 px-4 text-slate-600 font-medium hover:text-red-500 transition-colors"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center w-full py-3 px-4 bg-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-purple-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Войти
                            </Link>
                        )}
                        <button
                            onClick={() => scrollToSection('footer-form')}
                            className="w-full py-3 px-4 border-2 border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                        >
                            Оставить заявку <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
