import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectTime({ projectId }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalHours: 0, entries: 0 });

    useEffect(() => {
        loadEntries();
    }, [projectId]);

    const loadEntries = async () => {
        try {
            // Fetch all time entries
            // Similarly assuming we filter client-side if no direct endpoint
            // API usually has /time-entries?project_id=... but let's check
            const res = await clientApi.getTimeEntries();
            const projectEntries = res.data.filter(e => e.project_id === parseInt(projectId));

            setEntries(projectEntries.sort((a, b) => new Date(b.date) - new Date(a.date)));

            // Calc stats
            const total = projectEntries.reduce((acc, curr) => acc + (curr.hours || 0), 0);
            setStats({ totalHours: total, entries: projectEntries.length });

        } catch (error) {
            console.error("Failed to load time entries", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Laden...</div>;

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5); // HH:MM
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-slate-900">{stats.totalHours.toFixed(2)} h</div>
                        <p className="text-sm text-slate-500">Gesamtstunden</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-slate-900">{stats.entries}</div>
                        <p className="text-sm text-slate-500">Einträge</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-500" />
                        Zeiterfassung
                    </CardTitle>
                    {/* Placeholder for export */}
                    <Button variant="ghost" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            Keine Zeiteinträge für dieses Projekt.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Mitarbeiter</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>Ende</TableHead>
                                    <TableHead>Stunden</TableHead>
                                    <TableHead>Notiz</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium text-slate-600">
                                            {format(new Date(entry.date), 'dd.MM.yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {entry.user ? entry.user.first_name.charAt(0) : '?'}
                                                </div>
                                                <span className="text-sm">
                                                    {entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Unbekannt'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatTime(entry.start_time)}</TableCell>
                                        <TableCell>{formatTime(entry.end_time)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {entry.hours.toFixed(2)} h
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 italic text-sm">
                                            {entry.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
