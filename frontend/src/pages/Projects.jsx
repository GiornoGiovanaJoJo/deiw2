import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Trash2, Calendar, Pencil } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await clientApi.getProjects();
            setProjects(response.data);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Sind Sie sicher, dass Sie dieses Projekt löschen möchten?")) return;
        try {
            await clientApi.deleteProject(id);
            loadProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            alert("Fehler beim Löschen des Projekts.");
        }
    };

    const handleCreateClick = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleSave = (savedProject) => {
        loadProjects(); // Reload to reflect changes
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.projekt_nummer && project.projekt_nummer.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Geplant': return <Badge variant="outline" className="bg-slate-100 text-slate-800">Geplant</Badge>;
            case 'In Bearbeitung': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Bearbeitung</Badge>;
            case 'Abgeschlossen': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Abgeschlossen</Badge>;
            case 'Pausiert': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pausiert</Badge>;
            case 'Storniert': return <Badge variant="destructive">Storniert</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Projekte</h1>
                <Button onClick={handleCreateClick}>
                    <Plus className="w-4 h-4 mr-2" /> Neues Projekt
                </Button>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={editingProject}
                onSave={handleSave}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Projektübersicht</CardTitle>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Suche nach Name oder Nummer..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="flex h-10 w-full md:w-[200px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Alle Status</option>
                            <option value="Geplant">Geplant</option>
                            <option value="In Bearbeitung">In Bearbeitung</option>
                            <option value="Abgeschlossen">Abgeschlossen</option>
                            <option value="Pausiert">Pausiert</option>
                            <option value="Storniert">Storniert</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nummer</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Zeitraum</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Laden...</TableCell>
                                    </TableRow>
                                ) : filteredProjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">Keine Projekte gefunden</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.projekt_nummer || "-"}</TableCell>
                                            <TableCell>{project.name}</TableCell>
                                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '...'}
                                                    {' - '}
                                                    {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '...'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(project)}>
                                                        <Pencil className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    <Link to={`/projects/${project.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
