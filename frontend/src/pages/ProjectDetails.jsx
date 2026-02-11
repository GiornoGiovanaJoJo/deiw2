import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';
import { publicApi } from "@/api/public";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectStages from "@/components/project/ProjectStages";
import ProjectDocuments from "@/components/project/ProjectDocuments";
import ProjectChat from "@/components/project/ProjectChat";


import { useAuth } from '@/context/AuthContext';

export default function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // Mock Data for Demo
    const MOCK_PROJECTS = {
        'p1': {
            id: 'p1',
            name: 'Современный лофт',
            description: 'Полная реновация квартиры в индустриальном стиле. Использованы натуральные материалы, открытая проводка и кирпичная кладка.',
            status: 'Завершен',
            adresse: 'Москва, Центр',
            start_date: '2023-05-01',
            end_date: '2023-08-15',
            photos: [] // No external photos to avoid loading errors
        },
        'p2': {
            id: 'p2',
            name: 'Загородный дом',
            description: 'Строительство двухэтажного коттеджа из газобетона с панорамным остеклением и террасой.',
            status: 'В процессе',
            adresse: 'Подмосковье',
            start_date: '2023-09-01',
            photos: []
        },
        'p3': {
            id: 'p3',
            name: 'Офис IT',
            description: 'Современное офисное пространство open-space с зонами отдыха и переговорными.',
            status: 'Завершен',
            adresse: 'Москва, Сити',
            start_date: '2023-02-10',
            end_date: '2023-04-20',
            photos: []
        },
        'p4': {
            id: 'p4',
            name: 'Студия',
            description: 'Эргономичный дизайн для небольшой студии 25 кв.м.',
            status: 'Завершен',
            adresse: 'Санкт-Петербург',
            start_date: '2023-11-05',
            end_date: '2023-12-25',
            photos: []
        }
    };

    useEffect(() => {
        const loadProject = async () => {
            try {
                // Check if ID is a mock ID
                if (MOCK_PROJECTS[id]) {
                    setProject(MOCK_PROJECTS[id]);
                    setLoading(false);
                    return;
                }

                const data = await publicApi.getProjectById(id);
                setProject(data);
            } catch (err) {
                console.error("Failed to load project:", err);
                setError("Projekt konnte nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Fehler</h1>
                    <p className="text-slate-600 mb-6">{error || "Projekt nicht gefunden"}</p>
                    <Link to="/#projects" className="btn btn--primary">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zu Projekten
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900 landing-page">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-[60vh] bg-slate-900">
                    {project.main_image || (project.photos && project.photos.length > 0) || project.foto ? (
                        <img
                            src={project.main_image || (project.photos && project.photos.length > 0 ? project.photos[0] : project.foto)}
                            alt={project.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center opacity-60">
                            <span className="text-white text-xl">Kein Bild verfügbar</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12">
                        <div className="container">
                            <Link to="/#projects" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zu Projekten
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{project.name}</h1>
                            {project.adresse && (
                                <div className="flex items-center text-white/90 text-lg">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    {project.adresse}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Übersicht
                        </button>
                        {user && (
                            <>
                                <button
                                    onClick={() => setActiveTab('stages')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'stages' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Phasen
                                </button>
                                <button
                                    onClick={() => setActiveTab('docs')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'docs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Dokumente
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Kommunikation
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                {activeTab === 'details' && (
                    <section className="pb-16">
                        <div className="container">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4">Projektbeschreibung</h2>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {project.description || "Keine Beschreibung verfügbar."}
                                        </p>
                                    </div>

                                    {/* Gallery */}
                                    {project.photos && project.photos.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4">Galerie</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {project.photos.map((photo, index) => (
                                                    <div key={index} className="rounded-xl overflow-hidden h-64 border border-slate-100 shadow-sm">
                                                        <img
                                                            src={photo}
                                                            alt={`Projektbild ${index + 1}`}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h3 className="tex-lg font-bold mb-4">Details</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Tag className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <span className="block text-sm text-slate-500">Status</span>
                                                    <span className="font-medium">{project.status}</span>
                                                </div>
                                            </div>

                                            {(project.start_date || project.end_date) && (
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                                    <div>
                                                        <span className="block text-sm text-slate-500">Zeitraum</span>
                                                        <span className="font-medium">
                                                            {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : 'Start unbekannt'}
                                                            {' — '}
                                                            {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : 'Laufend'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'stages' && (
                    <div className="container pb-16">
                        <ProjectStages projectId={id} />
                    </div>
                )}

                {activeTab === 'docs' && (
                    <div className="container pb-16 space-y-8">
                        {/* Static Files from Project */}
                        {project.files && project.files.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Projektdateien</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {project.files.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                                        >
                                            <div className="bg-blue-100 p-2 rounded-md mr-3 group-hover:bg-blue-200">
                                                <Tag className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                                                <p className="text-xs text-slate-500 uppercase">{file.type?.split('/')[1] || 'FILE'}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <ProjectDocuments projectId={id} />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="container pb-16">
                        <ProjectChat projectId={id} />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
