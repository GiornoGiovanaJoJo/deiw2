import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ThumbsUp,
    Zap,
    Heart,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react';
import './Home.css';
import { publicApi } from "@/api/public";
import ServiceCard from "@/components/ServiceCard";
import ProjectCard from "@/components/ProjectCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceModal from "@/components/ServiceModal";
import HeroCarousel from "@/components/HeroCarousel";
import { useTranslation } from 'react-i18next';

export default function Home() {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [currentService, setCurrentService] = useState(0);
    const [visibleServices, setVisibleServices] = useState(1);
    const [heroContent, setHeroContent] = useState(null);
    const [servicesContent, setServicesContent] = useState(null);

    // Modal State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dynamic Data State
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Project Pagination
    const [projectPage, setProjectPage] = useState(0);
    const projectsPerPage = 3;

    // Data Fetching
    useEffect(() => {
        const loadPublicData = async () => {
            try {
                const [cats, projs, heroData, servicesData] = await Promise.all([
                    publicApi.getCategories().catch(err => {
                        console.error("Error fetching categories:", err);
                        return [];
                    }),
                    publicApi.getProjects().catch(err => {
                        console.error("Error fetching projects:", err);
                        return [];
                    }),
                    publicApi.getContent('home_hero').catch(err => null),
                    publicApi.getContent('home_services').catch(err => null)
                ]);

                if (heroData) {
                    setHeroContent(heroData.content);
                }

                if (servicesContent) {
                    setServicesContent(servicesData.content);
                }

                if (cats && cats.length > 0) {
                    setServices(cats);
                } else {
                    setServices([
                        { id: 1, name: 'Жилое строительство', description: 'Строительство современных жилых комплексов и частных домов под ключ.', icon_name: 'home' },
                        { id: 2, name: 'Коммерческая недвижимость', description: 'Офисные здания, торговые центры и складские помещения.', icon_name: 'building' },
                        { id: 3, name: 'Реконструкция', description: 'Восстановление и модернизация существующих зданий.', icon_name: 'hammer' },
                        { id: 4, name: 'Проектирование', description: 'Разработка архитектурных и инженерных проектов любой сложности.', icon_name: 'pen-tool' },
                        { id: 5, name: 'Ландшафтный дизайн', description: 'Благоустройство территорий и создание уникальных ландшафтов.', icon_name: 'tree' }
                    ]);
                }

                if (projs && projs.length > 0) {
                    setProjects(projs);
                } else {
                    setProjects([
                        { id: 'p1', name: 'Современный лофт', description: 'Ремонт квартиры в стиле лофт', status: 'Завершен', adresse: 'Москва, Центр' },
                        { id: 'p2', name: 'Загородный дом', description: 'Строительство коттеджа под ключ', status: 'В процессе', adresse: 'Подмосковье' },
                        { id: 'p3', name: 'Офис IT', description: 'Отделка офисного помещения', status: 'Завершен', adresse: 'Москва, Сити' },
                    ]);
                }
            } catch (error) {
                console.error("Failed to load public data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPublicData();
    }, []);

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Resize listener for services carousel
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setVisibleServices(3);
            else if (window.innerWidth >= 768) setVisibleServices(2);
            else setVisibleServices(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        }, 500);

        return () => observer.disconnect();
    }, [services, projects]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleNextService = () => {
        const max = Math.max(0, services.length - visibleServices);
        setCurrentService(curr => Math.min(curr + 1, max));
    };

    const handlePrevService = () => {
        setCurrentService(curr => Math.max(curr - 1, 0));
    };

    // Project Pagination Handlers
    const handleNextProjectPage = () => {
        const maxPage = Math.ceil(projects.length / projectsPerPage) - 1;
        setProjectPage(curr => Math.min(curr + 1, maxPage));
    };

    const handlePrevProjectPage = () => {
        setProjectPage(curr => Math.max(curr - 1, 0));
    };

    const visibleProjects = projects.slice(
        projectPage * projectsPerPage,
        (projectPage + 1) * projectsPerPage
    );

    // Modal Handler
    const handleServiceClick = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div className="landing-page font-sans text-slate-900 bg-white">
            <Header />

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
            />

            <main>
                {/* Hero */}
                <section className="hero" id="hero">
                    <div className="container">
                        <div className="hero__content">
                            <h1 className="hero__title">
                                {heroContent?.logo ? (
                                    <img src={heroContent.logo} alt="Empire Premium" className="h-16 mb-4" />
                                ) : (
                                    <span className="hero__brand">Empire Premium</span>
                                )}
                                {!heroContent?.logo && " — "}
                                <span className="hero__title-small">{heroContent?.title || t('hero.title_default')}</span>
                            </h1>
                            <p className="hero__subtitle">
                                {heroContent?.subtitle || t('hero.subtitle_default')}
                            </p>
                            <div className="hero__buttons">
                                <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary">
                                    {t('nav.request')} <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                            <div className="hero__stats">
                                <div className="hero__stat">
                                    <div className="hero__stat-num">2+</div>
                                    <div className="hero__stat-label">{t('hero.years_exp')}</div>
                                </div>
                                <div className="hero__stat">
                                    <div className="hero__stat-num">200+</div>
                                    <div className="hero__stat-label">{t('hero.projects_done')}</div>
                                </div>
                                <div className="hero__stat">
                                    <div className="hero__stat-num">5</div>
                                    <div className="hero__stat-label">{t('hero.warranty')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="hero__visual">
                            <div className="hero__visual-inner" style={{ height: '130%' }}>
                                <div className="hero__visual-placeholder h-full">
                                    {heroContent?.images && heroContent.images.length > 0 ? (
                                        <HeroCarousel images={heroContent.images} />
                                    ) : (
                                        <img
                                            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop"
                                            alt="Hero Building"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="section features" id="about">
                    <div className="container">
                        <div className="features__wrap">
                            <div className="features__text">
                                <h2 className="section__title animate-on-scroll section__title--split">
                                    <span className="section__title-accent">{t('features.title_accent')}</span> <span className="section__title-base">{t('features.title_base')}</span>
                                </h2>
                                <p className="section__subtitle animate-on-scroll">{t('features.subtitle')}</p>
                                <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                                    {t('features.contact_us')} <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                            <div className="features__grid">
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><ThumbsUp /></div>
                                    <h3 className="feature-card__title">{t('features.quality_title')}</h3>
                                    <p className="feature-card__text">{t('features.quality_text')}</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Zap /></div>
                                    <h3 className="feature-card__title">{t('features.innovative_title')}</h3>
                                    <p className="feature-card__text">{t('features.innovative_text')}</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Heart /></div>
                                    <h3 className="feature-card__title">{t('features.client_title')}</h3>
                                    <p className="feature-card__text">{t('features.client_text')}</p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section className="section services" id="services">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll mb-8">{servicesContent?.title || t('services.title_default')}</h2>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="relative">
                                <div className="overflow-hidden p-2 -m-2">
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out gap-6"
                                        style={{ transform: `translateX(calc(-${(currentService * (100 / visibleServices))}%)` }}
                                    >
                                        {services.map((service, idx) => (
                                            <div
                                                key={service.id || idx}
                                                className="flex-shrink-0 animate-on-scroll"
                                                style={{ width: `calc((100% - ${(visibleServices - 1) * 24}px) / ${visibleServices})` }}
                                            >
                                                <ServiceCard
                                                    category={service}
                                                    onClick={() => handleServiceClick(service)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={handlePrevService}
                                        className="services__arrow"
                                        disabled={currentService === 0}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextService}
                                        className="services__arrow"
                                        disabled={currentService >= services.length - visibleServices}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {services.length === 0 && !loading && (
                            <p className="text-center text-slate-400 py-12">{t('services.empty')}</p>
                        )}
                    </div>
                </section>

                {/* Projects */}
                <section className="section projects" id="projects">
                    <div className="container">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section__title animate-on-scroll">{t('projects.title')}</h2>
                            {/* Pagination Controls */}
                            {projects.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevProjectPage}
                                        disabled={projectPage === 0}
                                        className="services__arrow w-10 h-10 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextProjectPage}
                                        disabled={(projectPage + 1) * projectsPerPage >= projects.length}
                                        className="services__arrow w-10 h-10 disabled:opacity-50"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="projects__grid">
                                {visibleProjects.map((project, idx) => (
                                    <div key={project.id || idx} className="h-full animate-on-scroll">
                                        <ProjectCard project={project} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects.length === 0 && !loading && (
                            <p className="text-center text-slate-400 py-12">{t('projects.empty')}</p>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section" id="contact">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll whitespace-pre-line">{t('cta.title')}</h2>
                        <p className="section__subtitle animate-on-scroll mb-8">{t('cta.subtitle')}</p>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                            {t('features.contact_us')} <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
