import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';

export default function ProjectNew() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;
    const ticketData = location.state?.ticketData;

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]); // For Projektleiter selection
    const [subcontractors, setSubcontractors] = useState([]);

    const [form, setForm] = useState({
        name: ticketData?.name || '',
        description: ticketData?.description || '',
        status: 'Geplant',
        priority: 'Mittel',
        start_date: '',
        end_date: '',
        budget: '',
        address: '',
        customer_id: '',
        category_id: '',
        projektleiter_id: '',
        gruppenleiter_ids: [],
        worker_ids: [],
        subcontractor_ids: [],
        main_image: '',
        photos: [], // Gallery
        files: []   // Documents
    });

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const [custRes, catRes, usersRes] = await Promise.all([
                    clientApi.getCustomers(),
                    clientApi.getCategories(),
                    clientApi.getAllUsers(),
                    clientApi.getSubcontractors()
                ]);
                setCustomers(custRes.data);
                setCategories(catRes.data);
                setUsers(usersRes.data);
                setSubcontractors(subRes.data);
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
                    projektleiter_id: project.projektleiter_id || '',
                    gruppenleiter_ids: project.gruppenleiter ? project.gruppenleiter.map(u => u.id) : [],
                    worker_ids: project.workers ? project.workers.map(u => u.id) : [],
                    subcontractor_ids: project.subcontractors ? project.subcontractors.map(s => s.id) : [],
                    main_image: project.main_image || '',
                    photos: project.photos || [],
                    files: project.files || []
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
                gruppenleiter_ids: form.gruppenleiter_ids.map(id => parseInt(id)),
                worker_ids: form.worker_ids.map(id => parseInt(id)),
                subcontractor_ids: form.subcontractor_ids.map(id => parseInt(id)),
                main_image: form.main_image,
                photos: form.photos,
                files: form.files
            };

            if (isEditMode) {
                await clientApi.updateProject(id, payload);
            } else {
                const res = await clientApi.createProject(payload);
                // If this was a ticket conversion, close the ticket and link it
                if (ticketData?.requestId) {
                    await clientApi.updateTicket(ticketData.requestId, {
                        status: 'Geschlossen',
                        response: `In Projekt umgewandelt: ${res.data.name}`
                    });
                    // Link project to ticket if backend supports it (optional/future)
                }
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
                                <Label htmlFor="gruppenleiter">Gruppenleiter</Label>
                                <select
                                    id="gruppenleiter"
                                    multiple
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 h-32"
                                    value={form.gruppenleiter_ids}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setForm({ ...form, gruppenleiter_ids: values });
                                    }}
                                >
                                    {users.filter(u => u.role === 'Gruppenleiter' || u.role === 'Admin' || u.role === 'Projektleiter').map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.first_name} {u.last_name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">Strg+Klick für Mehrfachauswahl</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="workers">Mitarbeiter (Worker)</Label>
                                <select
                                    id="workers"
                                    multiple
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 h-32"
                                    value={form.worker_ids}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setForm({ ...form, worker_ids: values });
                                    }}
                                >
                                    {users.filter(u => u.role === 'Worker').map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.first_name} {u.last_name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">Strg+Klick für Mehrfachauswahl</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subcontractors">Subunternehmer</Label>
                                <select
                                    id="subcontractors"
                                    multiple
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 h-32"
                                    value={form.subcontractor_ids}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setForm({ ...form, subcontractor_ids: values });
                                    }}
                                >
                                    {subcontractors.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.company_name} ({s.trade})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">Strg+Klick für Mehrfachauswahl</p>
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

                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-medium">Medien & Dateien</h3>

                            {/* Main Image */}
                            <div className="space-y-2">
                                <Label htmlFor="main_image">Hauptbild (Cover)</Label>
                                <Input
                                    id="main_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                            setLoading(true);
                                            const res = await clientApi.uploadImage(file);
                                            setForm(prev => ({ ...prev, main_image: res.data.url }));
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Fehler beim Hochladen des Hauptbildes");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                                {form.main_image && (
                                    <div className="mt-2 relative w-full md:w-1/2 h-48 bg-slate-100 rounded-md overflow-hidden border">
                                        <img src={form.main_image} alt="Main Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            onClick={() => setForm(prev => ({ ...prev, main_image: '' }))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Gallery */}
                            <div className="space-y-2">
                                <Label htmlFor="gallery">Galerie (Zusätzliche Bilder)</Label>
                                <Input
                                    id="gallery"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files);
                                        if (files.length === 0) return;

                                        try {
                                            setLoading(true);
                                            const uploadPromises = files.map(file => clientApi.uploadImage(file));
                                            const responses = await Promise.all(uploadPromises);
                                            const newUrls = responses.map(res => res.data.url);

                                            setForm(prev => ({
                                                ...prev,
                                                photos: [...(prev.photos || []), ...newUrls]
                                            }));
                                        } catch (err) {
                                            console.error("Gallery upload failed", err);
                                            alert("Fehler beim Hochladen der Galeriebilder");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {(form.photos || []).map((url, index) => (
                                        <div key={index} className="relative h-32 bg-slate-100 rounded-md overflow-hidden border">
                                            <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 scale-75"
                                                onClick={() => setForm(prev => ({
                                                    ...prev,
                                                    photos: prev.photos.filter((_, i) => i !== index)
                                                }))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Files */}
                            <div className="space-y-2">
                                <Label htmlFor="files">Dokumente (PDF, DOCX, etc.)</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files);
                                        if (files.length === 0) return;

                                        try {
                                            setLoading(true);
                                            // Assuming uploadImage handles generic files too, or we need a specific endpoint. 
                                            // Implementation plan said verified generic upload.
                                            const uploadPromises = files.map(file => clientApi.uploadImage(file));
                                            const responses = await Promise.all(uploadPromises);

                                            const newFiles = responses.map((res, idx) => ({
                                                name: files[idx].name,
                                                url: res.data.url,
                                                type: files[idx].type
                                            }));

                                            setForm(prev => ({
                                                ...prev,
                                                files: [...(prev.files || []), ...newFiles]
                                            }));
                                        } catch (err) {
                                            console.error("File upload failed", err);
                                            alert("Fehler beim Hochladen der Dateien");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                                <div className="space-y-2 mt-2">
                                    {(form.files || []).map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 border rounded-md">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="text-sm font-medium truncate">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => setForm(prev => ({
                                                    ...prev,
                                                    files: prev.files.filter((_, i) => i !== index)
                                                }))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
