import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProjectStages({ projectId, readOnly = false }) {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "Geplant",
        start_date: "",
        end_date: "",
        order: 0
    });

    useEffect(() => {
        if (projectId) loadStages();
    }, [projectId]);

    const loadStages = async () => {
        setLoading(true);
        try {
            const res = await clientApi.getProjectStages(projectId);
            setStages(res.data.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error("Error loading stages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const data = {
                projectId: parseInt(projectId),
                ...form,
                order: parseInt(form.order) || 0
            };

            if (editingStage) {
                await clientApi.updateProjectStage(editingStage.id, data);
            } else {
                await clientApi.createProjectStage({ ...data, project_id: parseInt(projectId) });
            }
            setDialogOpen(false);
            loadStages();
        } catch (error) {
            console.error("Error saving stage:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Phase wirklich löschen?")) {
            // Assuming delete endpoint exists or we implement it
            // await clientApi.deleteProjectStage(id);
            console.warn("Delete stage not implemented yet in client");
        }
    };

    const openNewDialog = () => {
        setEditingStage(null);
        setForm({
            name: "",
            description: "",
            status: "Geplant",
            start_date: "",
            end_date: "",
            order: stages.length + 1
        });
        setDialogOpen(true);
    };

    const openEditDialog = (stage) => {
        setEditingStage(stage);
        setForm({
            name: stage.name,
            description: stage.description || "",
            status: stage.status,
            start_date: stage.start_date || "",
            end_date: stage.end_date || "",
            order: stage.order
        });
        setDialogOpen(true);
    };

    const statusColors = {
        "Geplant": "bg-slate-100 text-slate-700",
        "In Arbeit": "bg-blue-100 text-blue-700",
        "Abgeschlossen": "bg-emerald-100 text-emerald-700",
        "Pausiert": "bg-amber-100 text-amber-700"
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Projektphasen</h3>
                {!readOnly && (
                    <Button onClick={openNewDialog} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Phase hinzufügen
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-4 text-slate-500">Laden...</p>
                ) : stages.length === 0 ? (
                    <p className="text-center py-4 text-slate-500 border rounded-lg bg-slate-50">Keine Phasen definiert</p>
                ) : (
                    stages.map((stage) => (
                        <Card key={stage.id} className="overflow-hidden">
                            <div className="p-4 flex items-start gap-4">
                                <div className="mt-1">
                                    {stage.status === "Abgeschlossen" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-slate-900">{stage.name}</h4>
                                        <Badge className={statusColors[stage.status] || "bg-slate-100"}>
                                            {stage.status}
                                        </Badge>
                                    </div>
                                    {stage.description && (
                                        <p className="text-sm text-slate-600 mt-1">{stage.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        {stage.start_date && <span>Start: {stage.start_date}</span>}
                                        {stage.end_date && <span>Ende: {stage.end_date}</span>}
                                    </div>
                                </div>
                                {!readOnly && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(stage)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(stage.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStage ? "Phase bearbeiten" : "Neue Phase"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Geplant">Geplant</SelectItem>
                                        <SelectItem value="In Arbeit">In Arbeit</SelectItem>
                                        <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                                        <SelectItem value="Pausiert">Pausiert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reihenfolge</Label>
                                <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Startdatum</Label>
                                <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Enddatum</Label>
                                <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleSave}>Speichern</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
