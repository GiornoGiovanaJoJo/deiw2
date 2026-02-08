import React, { useState, useEffect } from 'react';
import { clientApi } from "@/api/client";
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Trash2, Calendar, User } from "lucide-react";
import { format } from 'date-fns';

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Offen',
        priority: 'Mittel',
        due_date: '',
        project_id: '',
        assigned_to: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                clientApi.getMyTasks(),
                clientApi.getProjects(),
                clientApi.getAllUsers()
            ]);
            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                project_id: task.project_id?.toString() || '',
                assigned_to: task.assigned_to?.toString() || ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'Offen',
                priority: 'Mittel',
                due_date: '',
                project_id: '',
                assigned_to: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
            };

            if (editingTask) {
                await clientApi.updateTask(editingTask.id, payload);
            } else {
                await clientApi.createTask(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error("Failed to save task", error);
            alert("Fehler beim Speichern der Aufgabe");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Aufgabe wirklich löschen?")) return;
        try {
            await clientApi.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Offen': 'bg-slate-100 text-slate-800',
            'In Bearbeitung': 'bg-blue-100 text-blue-800',
            'Erledigt': 'bg-green-100 text-green-800',
            'Storniert': 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[status] || 'bg-slate-100'}>{status}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            'Niedrig': 'bg-slate-100 text-slate-600',
            'Mittel': 'bg-yellow-100 text-yellow-700',
            'Hoch': 'bg-orange-100 text-orange-700',
            'Kritisch': 'bg-red-100 text-red-700'
        };
        return <Badge variant="outline" className={colors[priority]}>{priority}</Badge>;
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Laden...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Aufgaben</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" /> Neue Aufgabe
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Suche..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">Alle Status</SelectItem>
                                <SelectItem value="Offen">Offen</SelectItem>
                                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                                <SelectItem value="Erledigt">Erledigt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titel</TableHead>
                                <TableHead>Projekt</TableHead>
                                <TableHead>Zugewiesen an</TableHead>
                                <TableHead>Priorität</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fällig am</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.map((task) => {
                                const project = projects.find(p => p.id === task.project_id);
                                const assignedUser = users.find(u => u.id === task.assigned_to);

                                return (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.title}</TableCell>
                                        <TableCell>
                                            {project ? (
                                                <div className="text-sm">
                                                    <div className="font-medium">{project.projekt_nummer}</div>
                                                    <div className="text-slate-500 text-xs truncate max-w-[150px]">{project.name}</div>
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {assignedUser ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                                                        {assignedUser.first_name[0]}{assignedUser.last_name[0]}
                                                    </div>
                                                    <span className="text-sm">{assignedUser.first_name} {assignedUser.last_name}</span>
                                                </div>
                                            ) : <span className="text-slate-400">Nicht zugewiesen</span>}
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                                        <TableCell>
                                            {task.due_date && (
                                                <div className={`flex items-center gap-1 text-sm ${new Date(task.due_date) < new Date() && task.status !== 'Erledigt' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(task.due_date), 'dd.MM.yyyy')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(task)}>
                                                <Edit2 className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Projekt</Label>
                                <Select
                                    value={formData.project_id}
                                    onValueChange={val => setFormData({ ...formData, project_id: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Projekt wählen" /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.projekt_nummer} - {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Zugewiesen an</Label>
                                <Select
                                    value={formData.assigned_to}
                                    onValueChange={val => setFormData({ ...formData, assigned_to: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Mitarbeiter wählen" /></SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.first_name} {u.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={val => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Offen">Offen</SelectItem>
                                        <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                                        <SelectItem value="Erledigt">Erledigt</SelectItem>
                                        <SelectItem value="Storniert">Storniert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Priorität</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={val => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Niedrig">Niedrig</SelectItem>
                                        <SelectItem value="Mittel">Mittel</SelectItem>
                                        <SelectItem value="Hoch">Hoch</SelectItem>
                                        <SelectItem value="Kritisch">Kritisch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fällig am</Label>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Speichern</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
