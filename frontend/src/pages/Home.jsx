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

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [currentService, setCurrentService] = useState(0);
    const [visibleServices, setVisibleServices] = useState(3); // Default to 3 for desktop

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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVisibleServices(1);
            } else if (window.innerWidth < 1024) {
                setVisibleServices(2);
            } else {
                setVisibleServices(3);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Helper: Scroll to section
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch categories and projects in parallel
                // Catch errors individually to allow partial success or fallback
                const [categoriesData, projectsData] = await Promise.all([
                    publicApi.getCategories().catch(err => {
                        console.error("Error fetching categories:", err);
                        return [];
                    }),
                    publicApi.getProjects().catch(err => {
                        console.error("Error fetching projects:", err);
                        return [];
                    })
                ]);

                // Handle Services (Categories)
                if (categoriesData && categoriesData.length > 0) {
                    setServices(categoriesData);
                } else {
                    // Default Services if API returns empty
                    setServices([
                        { id: 'd1', name: 'Ремонт квартир', description: 'Комплексный ремонт под ключ', icon_name: 'home' },
                        { id: 'd2', name: 'Строительство', description: 'Строительство домов и коттеджей', icon_name: 'hammer' },
                        { id: 'd3', name: 'Дизайн', description: 'Разработка дизайн-проектов', icon_name: 'pen-tool' },
                        { id: 'd4', name: 'Электрика', description: 'Электромонтажные работы любой сложности', icon_name: 'zap' },
                        { id: 'd5', name: 'Сантехника', description: 'Разводка труб и установка сантехники', icon_name: 'droplet' },
                    ]);
                }

                // Handle Projects
                if (projectsData && projectsData.length > 0) {
                    setProjects(projectsData);
                } else {
                    // Default Projects if API returns empty
                    setProjects([
                        { id: 'p1', name: 'Современный лофт', description: 'Ремонт квартиры в стиле лофт', status: 'Завершен', adresse: 'Москва, Центр', photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop'] },
                        { id: 'p2', name: 'Загородный дом', description: 'Строительство коттеджа под ключ', status: 'В процессе', adresse: 'Подмосковье', photos: ['https://images.unsplash.com/photo-1600596542815-e32c21574211?q=80&w=2675&auto=format&fit=crop'] },
                        { id: 'p3', name: 'Офис IT', description: 'Отделка офисного помещения', status: 'Завершен', adresse: 'Москва, Сити', photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop'] },
                        { id: 'p4', name: 'Студия', description: 'Дизайнерский ремонт студии', status: 'Завершен', adresse: 'Санкт-Петербург', photos: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop'] },
                    ]);
                }

            } catch (error) {
                console.error("Critical error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleServiceClick = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    // Service Carousel Handlers
    const handlePrevService = () => {
        setCurrentService(prev => Math.max(0, prev - 1));
    };

    const handleNextService = () => {
        setCurrentService(prev => Math.min(services.length - visibleServices, prev + 1));
    };

    // Project Pagination Handlers
    const handlePrevProjectPage = () => {
        setProjectPage(prev => Math.max(0, prev - 1));
    };

    const handleNextProjectPage = () => {
        const maxPage = Math.ceil(projects.length / projectsPerPage) - 1;
        setProjectPage(prev => Math.min(maxPage, prev + 1));
    };

    // Computed Visible Projects
    const visibleProjects = projects.slice(
        projectPage * projectsPerPage,
        (projectPage + 1) * projectsPerPage
    );

    return (
        <div className="landing-page font-sans text-slate-900 bg-white">
            <Header />

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
            />

            <main>
                {/* Hero Section */}
                <section className="hero relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-10000 hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2531&auto=format&fit=crop")' }}
                    ></div>

                    <div className="container relative z-20 text-center text-white px-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up">
                            Строим будущее <br />
                            <span className="text-primary">вашего комфорта</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
                            Профессиональный ремонт и строительство с гарантией качества и соблюдением сроков.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
                            <button
                                onClick={() => scrollToSection('services')}
                                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Заказать услуги
                            </button>
                            <button
                                onClick={() => scrollToSection('projects')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <ThumbsUp className="w-5 h-5" />
                                Наши работы
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center animate-bounce">
                        <ArrowRight className="w-6 h-6 text-white transform rotate-90" />
                    </div>
                </section>


                {/* ... (existing sections) */}

                {/* Services */}
                <section className="section services" id="services">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll mb-8">Наши услуги</h2>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
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
                            <p className="text-center text-slate-400 py-12">Услуги скоро появятся</p>
                        )}
                    </div>
                </section>

                {/* Projects */}
                <section className="section projects" id="projects">
                    <div className="container">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section__title animate-on-scroll">Наши проекты</h2>
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
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
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
                            <p className="text-center text-slate-400 py-12">Проекты скоро появятся</p>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section" id="contact">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll">У вас есть вопросы, предложения или<br />нужна помощь с вашим проектом?</h2>
                        <p className="section__subtitle animate-on-scroll mb-8">Свяжитесь с нами — ответим в течение 15 минут и обсудим вашу задачу.</p>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                            Связаться с нами <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
