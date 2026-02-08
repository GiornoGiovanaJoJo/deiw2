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

                    <nav className="nav">
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
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--outline-purple">
                            Оставить заявку <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                    <button className="hamburger lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`} style={{ zIndex: 1001 }}>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => scrollToSection('about')} className="nav__link text-left">О нас</button>
                    <button onClick={() => scrollToSection('services')} className="nav__link text-left">Услуги</button>
                    <button onClick={() => scrollToSection('projects')} className="nav__link text-left">Проекты</button>
                    <button onClick={() => scrollToSection('contact')} className="nav__link text-left">Карьера</button>
                </nav>
                <div className="mt-8 flex flex-col gap-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="btn btn--gold w-full text-center">
                                Профиль
                            </Link>
                            <Button onClick={logout} variant="ghost" className="w-full">
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn--gold w-full text-center">
                            Войти
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
