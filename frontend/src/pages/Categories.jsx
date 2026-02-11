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
import { Folder, Plus, Trash2, Pencil, Save, X, GripVertical } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        parent_id: 'none',
        label: '',
        image_url: '',
    });

    // Builder State
    const [fields, setFields] = useState([]);
    const [stages, setStages] = useState([]);
    const [activeTab, setActiveTab] = useState("general");

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
        setFormData({
            name: '',
            parent_id: 'none',
            label: '',
            image_url: '',
        });
        setFields([]);
        setStages([]);
        setActiveTab("general");
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            parent_id: cat.parent_id ? cat.parent_id.toString() : 'none',
            label: cat.label || '',
            image_url: cat.image_url || '',
        });

        // Parse Config
        if (cat.modal_config) {
            let config = cat.modal_config;
            // Fields
            if (config.fields && Array.isArray(config.fields)) {
                setFields(config.fields);
            } else {
                setFields([]);
            }
            // Stages
            if (config.stages && Array.isArray(config.stages)) {
                setStages(config.stages);
            } else {
                setStages([]);
            }
        } else {
            setFields([]);
            setStages([]);
        }

        setActiveTab("general");
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            // Construct modal_config
            const modalConfig = {
                formTitle: `Anfrage für ${formData.name}`,
                fields: fields,
                stages: stages
            };

            const payload = {
                name: formData.name,
                type: 'Projekt',
                parent_id: formData.parent_id === 'none' ? null : parseInt(formData.parent_id),
                label: formData.label,
                image_url: formData.image_url,
                modal_config: modalConfig
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
        if (!window.confirm("Sind Sie sicher?")) return;
        try {
            await clientApi.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    // Builder Helpers
    const addField = () => {
        setFields([...fields, { name: `field_${Date.now()}`, label: 'Neues Feld', type: 'text', required: false, options: [] }]);
    };
    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };
    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const addStage = () => {
        setStages([...stages, { name: 'Neue Phase', status: 'Geplant', order: stages.length + 1 }]);
    };
    const updateStage = (index, key, value) => {
        const newStages = [...stages];
        if (key === 'order') value = parseInt(value) || 0;
        newStages[index][key] = value;
        setStages(newStages);
    };
    const removeStage = (index) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    // Filter only parent categories for the dropdown
    const parentCategories = categories.filter(c => !c.parent_id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Kategorien & Leistungen</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-fit lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Kategorie bearbeiten' : 'Neue Kategorie / Leistung'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="general">Allgemein</TabsTrigger>
                                    <TabsTrigger value="fields">Felder</TabsTrigger>
                                    <TabsTrigger value="stages">Phasen</TabsTrigger>
                                </TabsList>

                                {/* GENERAL TAB */}
                                <TabsContent value="general" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="Name der Kategorie"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Zusatzbeschriftung (Label)</Label>
                                        <Input
                                            placeholder="z.B. 'Neu' oder 'Beliebt'"
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Übergeordnete Kategorie</Label>
                                        <Select value={formData.parent_id} onValueChange={(v) => setFormData({ ...formData, parent_id: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Keine (Hauptkategorie)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Keine (Hauptkategorie)</SelectItem>
                                                {parentCategories
                                                    .filter(c => c.id !== editingId)
                                                    .map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bild</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                try {
                                                    const res = await clientApi.uploadImage(file);
                                                    setFormData({ ...formData, image_url: res.data.url });
                                                } catch (err) {
                                                    console.error("Upload failed", err);
                                                    alert("Fehler beim Hochladen des Bildes");
                                                }
                                            }}
                                        />
                                        {formData.image_url && (
                                            <div className="mt-2 relative h-32 bg-slate-100 rounded-md overflow-hidden border">
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 scale-75"
                                                    onClick={() => setFormData({ ...formData, image_url: '' })}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* FIELDS TAB */}
                                <TabsContent value="fields" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Formular Felder</Label>
                                            <Button type="button" size="sm" variant="outline" onClick={addField}>
                                                <Plus className="w-4 h-4 mr-1" /> Feld
                                            </Button>
                                        </div>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {fields.length === 0 && (
                                                <p className="text-sm text-slate-500 text-center py-4 border border-dashed rounded-md">Keine Felder definiert</p>
                                            )}
                                            {fields.map((field, idx) => (
                                                <div key={idx} className="p-3 border rounded-md bg-slate-50 space-y-3 relative group">
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeField(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Label</Label>
                                                            <Input
                                                                value={field.label}
                                                                onChange={(e) => updateField(idx, 'label', e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Typ</Label>
                                                            <Select value={field.type} onValueChange={(v) => updateField(idx, 'type', v)}>
                                                                <SelectTrigger className="h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="text">Text</SelectItem>
                                                                    <SelectItem value="number">Zahl</SelectItem>
                                                                    <SelectItem value="date">Datum</SelectItem>
                                                                    <SelectItem value="select">Auswahl</SelectItem>
                                                                    <SelectItem value="textarea">Textbereich</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={field.required}
                                                                onCheckedChange={(v) => updateField(idx, 'required', v)}
                                                            />
                                                            <Label className="text-xs">Pflichtfeld</Label>
                                                        </div>
                                                        <Input
                                                            name="fieldName"
                                                            value={field.name}
                                                            onChange={(e) => updateField(idx, 'name', e.target.value)}
                                                            className="h-8 w-1/2 text-xs font-mono text-slate-500"
                                                            placeholder="tech_name"
                                                        />
                                                    </div>

                                                    {field.type === 'select' && (
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Optionen (Komma getrennt)</Label>
                                                            <Input
                                                                value={Array.isArray(field.options) ? field.options.join(',') : field.options}
                                                                onChange={(e) => updateField(idx, 'options', e.target.value.split(','))}
                                                                className="h-8 text-sm"
                                                                placeholder="Option 1, Option 2"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* STAGES TAB */}
                                <TabsContent value="stages" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Projektphasen (Vorlage)</Label>
                                            <Button type="button" size="sm" variant="outline" onClick={addStage}>
                                                <Plus className="w-4 h-4 mr-1" /> Phase
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                            {stages.length === 0 && (
                                                <p className="text-sm text-slate-500 text-center py-4 border border-dashed rounded-md">Keine Phasen definiert (Standard wird verwendet)</p>
                                            )}
                                            {stages.map((stage, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                                                    <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                                                    <Input
                                                        value={stage.order}
                                                        onChange={(e) => updateStage(idx, 'order', e.target.value)}
                                                        className="w-12 h-8 text-center p-1"
                                                        type="number"
                                                    />
                                                    <Input
                                                        value={stage.name}
                                                        onChange={(e) => updateStage(idx, 'name', e.target.value)}
                                                        className="flex-1 h-8"
                                                        placeholder="Phasenname"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                        onClick={() => removeStage(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2 pt-4 border-t">
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

                <Card className="h-fit lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Liste</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>Eltern</TableHead>
                                    <TableHead className="text-right">Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => {
                                    const parent = categories.find(p => p.id === cat.parent_id);
                                    return (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {cat.parent_id ? (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                    ) : (
                                                        <Folder className="w-4 h-4 text-blue-500" />
                                                    )}
                                                    {cat.name}
                                                </div>
                                            </TableCell>
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
                                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
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
