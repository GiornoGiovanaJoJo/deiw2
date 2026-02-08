import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from 'react-router-dom';

export default function ProjectNew() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]); // For Projektleiter selection

    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'Geplant',
        priority: 'Mittel',
        start_date: '',
        end_date: '',
        budget: '',
        address: '',
        customer_id: '',
        category_id: '',
        projektleiter_id: ''
    });

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const [custRes, catRes, usersRes] = await Promise.all([
                    clientApi.getCustomers(),
                    clientApi.getCategories(),
                    clientApi.getAllUsers()
                ]);
                setCustomers(custRes.data);
                setCategories(catRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Failed to load dependency data", error);
            }
        };

        const loadProject = async () => {
            if (!isEditMode) return;
            try {
                setLoading(true);
                const response = await clientApi.getProjectById(id);
                const project = response.data;

                // Map project data to form
                setForm({
                    name: project.name,
                    description: project.description || '',
                    status: project.status,
                    priority: project.priority || 'Mittel',
                    start_date: project.start_date ? project.start_date.split('T')[0] : '',
                    end_date: project.end_date ? project.end_date.split('T')[0] : '',
                    budget: project.budget || '',
                    address: project.address || '',
                    customer_id: project.customer_id || '',
                    category_id: project.category_id || '',
                    projektleiter_id: project.projektleiter_id || ''
                });
            } catch (error) {
                console.error("Failed to load project", error);
                alert("Fehler beim Laden des Projekts");
                navigate('/projects');
            } finally {
                setLoading(false);
            }
        };

        loadDependencies();
        loadProject();
    }, [id, isEditMode, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                budget: form.budget ? parseFloat(form.budget) : 0,
                customer_id: form.customer_id ? parseInt(form.customer_id) : null,
                category_id: form.category_id ? parseInt(form.category_id) : null,
                projektleiter_id: form.projektleiter_id ? parseInt(form.projektleiter_id) : null,
            };

            if (isEditMode) {
                await clientApi.updateProject(id, payload);
            } else {
                await clientApi.createProject(payload);
            }
            navigate(isEditMode ? `/projects/${id}` : '/projects');
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Fehler beim Speichern des Projekts.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !form.name) {
        return <div className="p-8 text-center">Laden...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link to={isEditMode ? `/projects/${id}` : "/projects"}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
                </h1>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Projektname *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse</Label>
                                <Input
                                    id="address"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer">Kunde</Label>
                                <select
                                    id="customer"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={form.customer_id}
                                    onChange={e => setForm({ ...form, customer_id: e.target.value })}
                                >
                                    <option value="">Wählen Sie einen Kunden</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.type === 'Firma' ? c.company_name : c.contact_person}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manager">Projektleiter</Label>
                                <select
                                    id="manager"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={form.projektleiter_id}
                                    onChange={e => setForm({ ...form, projektleiter_id: e.target.value })}
                                >
                                    <option value="">Wählen Sie einen Projektleiter</option>
                                    {users.filter(u => u.role === 'Projektleiter' || u.role === 'Admin').map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.first_name} {u.last_name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategorie</Label>
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={form.category_id}
                                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                                >
                                    <option value="">Kategorie wählen</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (€)</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    step="0.01"
                                    value={form.budget}
                                    onChange={e => setForm({ ...form, budget: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_date">Startdatum</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={form.start_date}
                                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Enddatum</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={form.end_date}
                                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="Geplant">Geplant</option>
                                    <option value="In Bearbeitung">In Bearbeitung</option>
                                    <option value="Pausiert">Pausiert</option>
                                    <option value="Abgeschlossen">Abgeschlossen</option>
                                    <option value="Storniert">Storniert</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priorität</Label>
                                <select
                                    id="priority"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    value={form.priority}
                                    onChange={e => setForm({ ...form, priority: e.target.value })}
                                >
                                    <option value="Niedrig">Niedrig</option>
                                    <option value="Mittel">Mittel</option>
                                    <option value="Hoch">Hoch</option>
                                    <option value="Kritisch">Kritisch</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Beschreibung</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link to={isEditMode ? `/projects/${id}` : "/projects"}>
                                <Button variant="outline" type="button">Abbrechen</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Speichere...' : isEditMode ? 'Änderungen speichern' : 'Projekt erstellen'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
