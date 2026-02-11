import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Plus, Trash2, Pencil, Save, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('none');
    const [label, setLabel] = useState('');
    const [image, setImage] = useState('');
    const [modalConfig, setModalConfig] = useState(''); // JSON string

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await clientApi.getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setParentCategory('none');
        setLabel('');
        setImage('');
        setModalConfig('');
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
        setParentCategory(cat.parent_id ? cat.parent_id.toString() : 'none');
        setLabel(cat.label || '');
        setImage(cat.image_url || '');
        setModalConfig(cat.modal_config ? JSON.stringify(cat.modal_config, null, 2) : '');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            let parsedConfig = null;
            if (modalConfig.trim()) {
                try {
                    parsedConfig = JSON.parse(modalConfig);
                } catch (err) {
                    alert("Modal Konfiguration ist kein gültiges JSON!");
                    return;
                }
            }

            const payload = {
                name: name,
                type: 'Projekt',
                parent_id: parentCategory === 'none' ? null : parseInt(parentCategory),
                label: label,
                image_url: image,
                modal_config: parsedConfig
            };

            if (editingId) {
                await clientApi.updateCategory(editingId, payload);
            } else {
                await clientApi.createCategory(payload);
            }

            resetForm();
            loadCategories();
        } catch (error) {
            console.error("Failed to save category", error);
            alert("Fehler beim Speichern der Kategorie");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await clientApi.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    // Filter only parent categories for the dropdown
    const parentCategories = categories.filter(c => !c.parent_id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Kategorien & Leistungen</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Kategorie bearbeiten' : 'Neue Kategorie / Leistung'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="Name der Kategorie"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zusatzbeschriftung (Label)</label>
                                <Input
                                    placeholder="z.B. 'Neu' или 'Beliebt'"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Übergeordnete Kategorie</label>
                                <Select value={parentCategory} onValueChange={setParentCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Keine (Hauptkategorie)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Keine (Hauptkategorie)</SelectItem>
                                        {parentCategories
                                            .filter(c => c.id !== editingId) // Prevent self-parenting
                                            .map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bild</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                            const res = await clientApi.uploadImage(file);
                                            setImage(res.data.url);
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Fehler beim Hochladen des Bildes");
                                        }
                                    }}
                                />
                                {image && (
                                    <div className="mt-2 relative h-32 bg-slate-100 rounded-md overflow-hidden border">
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 scale-75"
                                            onClick={() => setImage('')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Modal Konfiguration (JSON)</label>
                                <p className="text-xs text-slate-500">
                                    Definiert Felder für das Anfrage-Modal.
                                </p>
                                <Textarea
                                    rows={8}
                                    className="font-mono text-xs"
                                    placeholder={`{
  "formTitle": "Individuelle Anfrage",
  "fields": [
    { "name": "area", "label": "Fläche (m²)", "type": "number", "required": true },
    { "name": "type", "label": "Typ", "type": "select", "options": ["Haus", "Wohnung"] }
  ]
}`}
                                    value={modalConfig}
                                    onChange={(e) => setModalConfig(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" className="flex-1">
                                    {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingId ? 'Speichern' : 'Hinzufügen'}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Liste</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>Eltern-Kategorie</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => {
                                    const parent = categories.find(p => p.id === cat.parent_id);
                                    return (
                                        <TableRow key={cat.id}>
                                            <TableCell>
                                                {cat.parent_id ? (
                                                    <div className="ml-4 w-2 h-2 rounded-full bg-slate-300"></div>
                                                ) : (
                                                    <Folder className="w-4 h-4 text-primary" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.type}</TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {parent ? parent.name : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                                                        <Pencil className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Keine Kategorien gefunden
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
