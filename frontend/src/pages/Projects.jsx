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
import ProjectAdminModal from "@/components/ProjectAdminModal";
import { FolderCog } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Projects() {
    const { t, i18n } = useTranslation();
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
        if (!window.confirm(t('projects_page.delete_confirm'))) return;
        try {
            await clientApi.deleteProject(id);
            loadProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            alert(t('projects_page.delete_error'));
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

    // Admin Modal State
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminModalProject, setAdminModalProject] = useState(null);

    const handleManageClick = (project) => {
        setAdminModalProject(project);
        setIsAdminModalOpen(true);
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.projekt_nummer && project.projekt_nummer.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        let label = status;
        switch (status) {
            case 'Geplant': label = t('projects_page.status.planned'); break;
            case 'In Bearbeitung': label = t('projects_page.status.in_progress'); break;
            case 'Abgeschlossen': label = t('projects_page.status.completed'); break;
            case 'Pausiert': label = t('projects_page.status.paused'); break;
            case 'Storniert': label = t('projects_page.status.cancelled'); break;
            default: label = status;
        }

        switch (status) {
            case 'Geplant': return <Badge variant="outline" className="bg-slate-100 text-slate-800">{label}</Badge>;
            case 'In Bearbeitung': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{label}</Badge>;
            case 'Abgeschlossen': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{label}</Badge>;
            case 'Pausiert': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{label}</Badge>;
            case 'Storniert': return <Badge variant="destructive">{label}</Badge>;
            default: return <Badge variant="secondary">{label}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'ru' ? 'ru-RU' : 'de-DE');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">{t('projects_page.title')}</h1>
                <Button onClick={handleCreateClick}>
                    <Plus className="w-4 h-4 mr-2" /> {t('projects_page.new_project')}
                </Button>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={editingProject}
                onSave={handleSave}
            />

            <ProjectAdminModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                project={adminModalProject}
                onUpdate={loadProjects}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('projects_page.overview')}</CardTitle>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder={t('projects_page.search_placeholder')}
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
                            <option value="All">{t('projects_page.all_statuses')}</option>
                            <option value="Geplant">{t('projects_page.status.planned')}</option>
                            <option value="In Bearbeitung">{t('projects_page.status.in_progress')}</option>
                            <option value="Abgeschlossen">{t('projects_page.status.completed')}</option>
                            <option value="Pausiert">{t('projects_page.status.paused')}</option>
                            <option value="Storniert">{t('projects_page.status.cancelled')}</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('projects_page.table.number')}</TableHead>
                                    <TableHead>{t('projects_page.table.name')}</TableHead>
                                    <TableHead>{t('projects_page.table.status')}</TableHead>
                                    <TableHead>{t('projects_page.table.period')}</TableHead>
                                    <TableHead className="text-right">{t('projects_page.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">{t('projects_page.table.loading')}</TableCell>
                                    </TableRow>
                                ) : filteredProjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">{t('projects_page.table.empty')}</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.projekt_nummer || "-"}</TableCell>
                                            <TableCell>
                                                <Link to={`/projects/${project.id}`} className="font-medium hover:underline text-blue-600">
                                                    {project.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(project.start_date)}
                                                    {' - '}
                                                    {formatDate(project.end_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleManageClick(project)} title={t('projects_page.actions.manage')}>
                                                        <FolderCog className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(project)} title={t('projects_page.actions.edit')}>
                                                        <Pencil className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    <Link to={`/projects/${project.id}`}>
                                                        <Button variant="ghost" size="sm" title={t('projects_page.actions.view')}>
                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)} title={t('projects_page.actions.delete')}>
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
