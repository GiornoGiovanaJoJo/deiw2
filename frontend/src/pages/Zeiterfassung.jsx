import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Implemented earlier
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"; // Implemented earlier
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Clock,
    Calendar as CalendarIcon,
    User,
    Briefcase
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export default function Zeiterfassung() {
    const [entries, setEntries] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterUser, setFilterUser] = useState("all");
    const [filterDate, setFilterDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [form, setForm] = useState({
        user_id: "",
        date: format(new Date(), "yyyy-MM-dd"),
        start_time: "08:00",
        end_time: "17:00",
        break_time: "60",
        project_id: "0",
        description: ""
    });

    useEffect(() => {
        loadData();
    }, [filterDate]); // Reload when date changes, or could load all and filter client side? date filter on backend is better.

    const loadData = async () => {
        setLoading(true);
        try {
            // In a real app we would pass filters to the API
            // const [entriesData, usersData, projectsData] = await Promise.all([
            //   clientApi.getTimeEntries(filterDate), 
            //   clientApi.getAllUsers(),
            //   clientApi.getMyProjects() // or getAllProjects if admin
            // ]);

            // For now, loading all and filtering locally or assuming existing API returns all
            const [entriesData, usersData, projectsData] = await Promise.all([
                clientApi.getTimeEntries(),
                clientApi.getAllUsers(),
                clientApi.getMyProjects()
            ]);

            let filtered = entriesData.data;
            if (filterDate) {
                filtered = filtered.filter(e => e.date === filterDate);
            }

            setEntries(filtered);
            setUsers(usersData.data);
            setProjects(projectsData.data);
        } catch (error) {
            console.error("Error loading time entries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const data = {
                user_id: parseInt(form.user_id),
                date: form.date,
                start_time: form.start_time,
                end_time: form.end_time || null,
                break_time: parseInt(form.break_time) || 0,
                project_id: form.project_id && form.project_id !== "0" ? parseInt(form.project_id) : null,
                description: form.description
            };

            if (editingEntry) {
                await clientApi.updateTimeEntry(editingEntry.id, data);
            } else {
                await clientApi.createTimeEntry(data);
            }
            setDialogOpen(false);
            loadData();
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Eintrag wirklich löschen?")) {
            // await clientApi.deleteTimeEntry(id); // create this method if missing
            // For now let's assume update with deleted flag or just omit
            console.warn("Delete not implemented in client yet");
        }
    };

    const openNewDialog = () => {
        setEditingEntry(null);
        setForm({
            user_id: users.length > 0 ? users[0].id.toString() : "",
            date: filterDate || format(new Date(), "yyyy-MM-dd"),
            start_time: "08:00",
            end_time: "17:00",
            break_time: "60",
            project_id: "0",
            description: ""
        });
        setDialogOpen(true);
    };

    const openEditDialog = (entry) => {
        setEditingEntry(entry);
        setForm({
            user_id: entry.user_id.toString(),
            date: entry.date,
            start_time: entry.start_time,
            end_time: entry.end_time || "",
            break_time: entry.break_time?.toString() || "0",
            project_id: entry.project_id ? entry.project_id.toString() : "0",
            description: entry.description || ""
        });
        setDialogOpen(true);
    };

    const getUserName = (id) => {
        const u = users.find(u => u.id === id);
        return u ? `${u.first_name} ${u.last_name}` : `ID: ${id}`;
    };

    const getProjectName = (id) => {
        if (!id) return "-";
        const p = projects.find(p => p.id === id);
        return p ? `${p.projekt_nummer} ${p.name}` : "-";
    };

    const calculateHours = (entry) => {
        if (!entry.end_time) return "Running";
        const start = parseISO(`2000-01-01T${entry.start_time}`);
        const end = parseISO(`2000-01-01T${entry.end_time}`);
        const diff = (end - start) / (1000 * 60); // minutes
        const net = diff - (entry.break_time || 0);
        const hours = Math.floor(net / 60);
        const mins = Math.floor(net % 60);
        return `${hours}h ${mins}m`;
    };

    const filteredEntries = entries.filter(e =>
        filterUser === "all" || e.user_id.toString() === filterUser
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Zeiterfassung</h1>
                    <p className="text-slate-500 mt-1">Arbeitszeiten verwalten</p>
                </div>
                <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Eintrag
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label className="mb-2 block">Datum</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <Label className="mb-2 block">Mitarbeiter</Label>
                            <Select value={filterUser} onValueChange={setFilterUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Alle Mitarbeiter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            {u.first_name} {u.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mitarbeiter</TableHead>
                                <TableHead>Zeiten</TableHead>
                                <TableHead>Pause</TableHead>
                                <TableHead>Gesamt</TableHead>
                                <TableHead>Projekt</TableHead>
                                <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
                                <TableHead className="w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">Laden...</TableCell>
                                </TableRow>
                            ) : filteredEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">Keine Einträge für dieses Datum</TableCell>
                                </TableRow>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">{getUserName(entry.user_id)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{entry.start_time} - {entry.end_time || "..."}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-500">{entry.break_time} min</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {calculateHours(entry)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {entry.project_id ? (
                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                                                    {getProjectName(entry.project_id)}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-sm text-slate-600 truncate max-w-[200px] block">{entry.description}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Eintrag bearbeiten" : "Neuer Zeiteintrag"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Datum</Label>
                                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Mitarbeiter</Label>
                                <Select value={form.user_id} onValueChange={v => setForm({ ...form, user_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Mitarbeiter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.first_name} {u.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ende</Label>
                                <Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pause (min)</Label>
                                <Input type="number" value={form.break_time} onChange={e => setForm({ ...form, break_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Projekt (Optional)</Label>
                            <Select value={form.project_id} onValueChange={v => setForm({ ...form, project_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Kein Projekt" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Kein Projekt</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.projekt_nummer} {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
