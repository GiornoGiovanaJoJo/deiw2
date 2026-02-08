import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, HardHat, Phone, Mail, Building2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function Subcontractors() {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [form, setForm] = useState({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        trade: "",
        notes: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await clientApi.getSubcontractors();
            setSubs(res.data);
        } catch (error) {
            console.error("Error loading subcontractors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingSub) {
                await clientApi.updateSubcontractor(editingSub.id, form);
            } else {
                await clientApi.createSubcontractor(form);
            }
            setDialogOpen(false);
            loadData();
        } catch (error) {
            console.error("Error saving subcontractor:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Subunternehmer wirklich löschen?")) {
            // await clientApi.deleteSubcontractor(id); // If API exists
            console.warn("Delete not implemented in client yet");
        }
    };

    const openNewDialog = () => {
        setEditingSub(null);
        setForm({
            company_name: "",
            contact_person: "",
            email: "",
            phone: "",
            trade: "",
            notes: ""
        });
        setDialogOpen(true);
    };

    const openEditDialog = (item) => {
        setEditingSub(item);
        setForm({
            company_name: item.company_name,
            contact_person: item.contact_person || "",
            email: item.email || "",
            phone: item.phone || "",
            trade: item.trade || "",
            notes: item.notes || ""
        });
        setDialogOpen(true);
    };

    const filteredSubs = subs.filter(s =>
        s.company_name.toLowerCase().includes(search.toLowerCase()) ||
        s.trade?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Subunternehmer</h1>
                    <p className="text-slate-500 mt-1">Externe Partner verwalten</p>
                </div>
                <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Partner
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Firma oder Gewerk suchen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Firma</TableHead>
                                <TableHead>Kontaktperson</TableHead>
                                <TableHead>Kontakt</TableHead>
                                <TableHead>Gewerk</TableHead>
                                <TableHead className="w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Laden...</TableCell>
                                </TableRow>
                            ) : filteredSubs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">Keine Subunternehmer gefunden</TableCell>
                                </TableRow>
                            ) : (
                                filteredSubs.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <span className="font-medium text-slate-900">{item.company_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600">{item.contact_person || "-"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-slate-500">
                                                {item.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                                {item.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.trade && <Badge variant="outline">{item.trade}</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSub ? "Partner bearbeiten" : "Neuer Partner"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Firmenname</Label>
                            <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kontaktperson</Label>
                                <Input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gewerk</Label>
                                <Input value={form.trade} onChange={e => setForm({ ...form, trade: e.target.value })} placeholder="z.B. Elektriker" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefon</Label>
                                <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notizen</Label>
                            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
