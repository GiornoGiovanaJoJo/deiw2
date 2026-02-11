import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ThumbsUp,
    Zap,
    Heart,
    ArrowRight,
    ArrowLeft,
    Home as HomeIcon,
    Hammer,
    PenTool,
    Droplet
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
                        { id: 'p1', name: 'Современный лофт', description: 'Ремонт квартиры в стиле лофт', status: 'Завершен', adresse: 'Москва, Центр' },
                        { id: 'p2', name: 'Загородный дом', description: 'Строительство коттеджа под ключ', status: 'В процессе', adresse: 'Подмосковье' },
                        { id: 'p3', name: 'Офис IT', description: 'Отделка офисного помещения', status: 'Завершен', adresse: 'Москва, Сити' },
                        { id: 'p4', name: 'Студия', description: 'Дизайнерский ремонт студии', status: 'Завершен', adresse: 'Санкт-Петербург' },
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
                {/* Hero Section */}
                <section className="hero relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
                    {/* Dynamic Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 opacity-90 z-0 animate-gradient-xy"></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                    <div className="container relative z-20 text-center text-white px-4">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-300 font-medium text-sm animate-fade-in-up">
                            ✨ Профессиональный ремонт и строительство
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight animate-fade-in-up delay-100 leading-tight">
                            Строим будущее <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                вашего комфорта
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed font-light">
                            Воплощаем мечты в реальность: от дизайн-проекта до сдачи ключей. Гарантия качества на каждом этапе.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                            <button
                                onClick={() => scrollToSection('services')}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Заказать услуги
                            </button>
                            <button
                                onClick={() => scrollToSection('projects')}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:border-white/40"
                            >
                                <ThumbsUp className="w-5 h-5" />
                                Наши работы
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center animate-bounce">
                        <ArrowRight className="w-6 h-6 text-slate-400 transform rotate-90" />
                    </div>
                </section>


                {/* ... (existing sections) */}

                {/* Services */}
                {/* Services */}
                <section className="section services py-20 bg-slate-50" id="services">
                    <div className="container">
                        <div className="text-center mb-16">
                            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block animate-on-scroll">Наши компетенции</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 animate-on-scroll">Услуги под ключ</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.map((service, idx) => {
                                    // Map icon_name to Lucide icon component if needed, or use defaults
                                    let IconComponent = null;
                                    switch (service.icon_name) {
                                        case 'home': IconComponent = HomeIcon; break;
                                        case 'hammer': IconComponent = Hammer; break;
                                        case 'pen-tool': IconComponent = PenTool; break;
                                        case 'zap': IconComponent = Zap; break;
                                        case 'droplet': IconComponent = Droplet; break;
                                        default: IconComponent = Zap;
                                    }

                                    return (
                                        <div key={service.id || idx} className="animate-on-scroll" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <ServiceCard
                                                category={service}
                                                icon={IconComponent}
                                                onClick={() => handleServiceClick(service)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {services.length === 0 && !loading && (
                            <p className="text-center text-slate-400 py-12">Услуги скоро появятся</p>
                        )}
                    </div>
                </section>

                {/* Projects */}
                <section className="section projects py-20 bg-white" id="projects">
                    <div className="container">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                            <div className="animate-on-scroll">
                                <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">Портфолио</span>
                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Реализованные проекты</h2>
                            </div>

                            {/* Pagination Controls */}
                            {projects.length > 0 && (
                                <div className="flex gap-2 animate-on-scroll">
                                    <button
                                        onClick={handlePrevProjectPage}
                                        disabled={projectPage === 0}
                                        className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextProjectPage}
                                        disabled={(projectPage + 1) * projectsPerPage >= projects.length}
                                        className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visibleProjects.map((project, idx) => (
                                    <div key={project.id || idx} className="h-full animate-on-scroll" style={{ animationDelay: `${idx * 150}ms` }}>
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
                {/* CTA */}
                <section className="cta-section py-20 relative overflow-hidden" id="contact">
                    <div className="container relative z-10">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                            <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-on-scroll relative z-10">
                                У вас есть вопросы или<br />нужна помощь с проектом?
                            </h2>
                            <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-on-scroll relative z-10">
                                Свяжитесь с нами — ответим в течение 15 минут и обсудим вашу задачу. Консультация бесплатна.
                            </p>
                            <button
                                onClick={() => scrollToSection('footer-form')}
                                className="px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto animate-on-scroll relative z-10"
                            >
                                Связаться с нами <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
