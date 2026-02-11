import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';
import { publicApi } from "@/api/public";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProjectDetails() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProject = async () => {
            try {
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
                    {project.main_image || (project.photos && project.photos.length > 0) ? (
                        <img
                            src={project.main_image || project.photos[0]}
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
                            {project.address && (
                                <div className="flex items-center text-white/90 text-lg">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    {project.address}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <section className="py-16">
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
                                                        {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : 'Abgeschlossen'}
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
            </main>

            <Footer />
        </div>
    );
}
