import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Coins, Users, User, FileText, Layers, Edit, Building2 } from "lucide-react";
import ProjectStages from "@/components/project/ProjectStages";
import ProjectDocuments from "@/components/project/ProjectDocuments";

export default function ProjectDetailsAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const response = await clientApi.getProjectById(id);
            setProject(response.data);
        } catch (error) {
            console.error("Failed to load project", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Laden...</div>;
    if (!project) return <div className="p-6 text-center">Projekt nicht gefunden</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/projects">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {project.projekt_nummer && <span className="text-slate-400 font-mono text-lg">{project.projekt_nummer}</span>}
                            {project.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline">{project.status}</Badge>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{project.priority}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Bearbeiten
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {['overview', 'stages', 'documents', 'team'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                            `}
                        >
                            {tab === 'overview' && 'Übersicht'}
                            {tab === 'stages' && 'Phasen & Zeitplan'}
                            {tab === 'documents' && 'Dokumente'}
                            {tab === 'team' && 'Team & Partner'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Beschreibung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 whitespace-pre-wrap">{project.description || "Keine Beschreibung vorhanden."}</p>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Standort</p>
                                            <p className="text-slate-500 text-sm">{project.address || "Keine Adresse"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Zeitraum</p>
                                            <p className="text-slate-500 text-sm">
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                                                {' bis '}
                                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Coins className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Budget</p>
                                            <p className="text-slate-500 text-sm">
                                                {project.budget ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(project.budget) : '0,00 €'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Kunde</CardTitle></CardHeader>
                                <CardContent>
                                    {project.customer ? (
                                        <div className="space-y-2">
                                            <p className="font-medium">{project.customer.type === 'Firma' ? project.customer.company_name : project.customer.contact_person}</p>
                                            <p className="text-sm text-slate-500">{project.customer.email}</p>
                                            <p className="text-sm text-slate-500">{project.customer.phone}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">Kein Kunde zugewiesen</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'stages' && (
                    <ProjectStages projectId={id} />
                )}

                {activeTab === 'documents' && (
                    <ProjectDocuments projectId={id} />
                )}

                {activeTab === 'team' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Projektteam</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Projektleitung
                                </h3>
                                {project.projektleiter ? (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {project.projektleiter.first_name[0]}{project.projektleiter.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">{project.projektleiter.first_name} {project.projektleiter.last_name}</p>
                                            <p className="text-xs text-slate-500">{project.projektleiter.email}</p>
                                        </div>
                                    </div>
                                ) : <p className="text-slate-500 text-sm">Nicht zugewiesen</p>}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Gruppenleiter
                                </h3>
                                <div className="space-y-2">
                                    {project.gruppenleiter && project.gruppenleiter.length > 0 ? (
                                        project.gruppenleiter.map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                <span className="text-sm">{u.first_name} {u.last_name}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Gruppenleiter</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Mitarbeiter (Worker)
                                </h3>
                                <div className="space-y-2">
                                    {project.workers && project.workers.length > 0 ? (
                                        project.workers.map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                <span className="text-sm">{u.first_name} {u.last_name}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Mitarbeiter</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Subunternehmer
                                </h3>
                                <div className="space-y-2">
                                    {project.subcontractors && project.subcontractors.length > 0 ? (
                                        project.subcontractors.map(s => (
                                            <div key={s.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                                                    {s.company_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{s.company_name}</p>
                                                    <p className="text-xs text-slate-500">{s.contact_person}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Subunternehmer</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


