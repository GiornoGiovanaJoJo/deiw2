import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card } from "@/components/ui/card";
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
import { Plus, FileText, Link as LinkIcon, Download, Trash2, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProjectDocuments({ projectId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        type: "Plan",
        url: "",
        content: ""
    });

    useEffect(() => {
        if (projectId) loadDocuments();
    }, [projectId]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const res = await clientApi.getDocuments(projectId);
            setDocuments(res.data);
        } catch (error) {
            console.error("Error loading documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await clientApi.createDocument({
                ...form,
                project_id: parseInt(projectId)
            });
            setDialogOpen(false);
            loadDocuments();
        } catch (error) {
            console.error("Error saving document:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Dokument wirklich löschen?")) {
            try {
                await clientApi.deleteDocument(id);
                loadDocuments();
            } catch (error) {
                console.error("Error deleting document:", error);
                alert("Fehler beim Löschen des Dokuments");
            }
        }
    };

    const openNewDialog = () => {
        setForm({
            title: "",
            type: "Plan",
            url: "",
            content: ""
        });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dokumente</h3>
                <Button onClick={openNewDialog} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Dokument hinzufügen
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p className="text-center py-4 text-slate-500 col-span-2">Laden...</p>
                ) : documents.length === 0 ? (
                    <p className="text-center py-4 text-slate-500 border rounded-lg bg-slate-50 col-span-2">Keine Dokumente vorhanden</p>
                ) : (
                    documents.map((doc) => (
                        <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 bg-slate-100 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 line-clamp-1">{doc.title}</h4>
                                        <Badge variant="outline" className="mt-1 text-xs">{doc.type}</Badge>
                                        {doc.created_at && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {doc.url && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(doc.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neues Dokument</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Typ</Label>
                            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Plan">Plan</SelectItem>
                                    <SelectItem value="Rechnung">Rechnung</SelectItem>
                                    <SelectItem value="Vertrag">Vertrag</SelectItem>
                                    <SelectItem value="Genehmigung">Genehmigung</SelectItem>
                                    <SelectItem value="Foto">Foto</SelectItem>
                                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>URL (Optional)</Label>
                            <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Inhalt / Notiz (Optional)</Label>
                            <Input value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
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
