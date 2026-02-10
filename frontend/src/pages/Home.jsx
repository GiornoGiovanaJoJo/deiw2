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
    const [visibleServices, setVisibleServices] = useState(1);

    // Modal State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dynamic Data State
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // ... (existing code)

    const handleServiceClick = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    // ... (existing code)

    return (
        <div className="landing-page font-sans text-slate-900 bg-white">
            <Header />

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
            />

            <main>
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
