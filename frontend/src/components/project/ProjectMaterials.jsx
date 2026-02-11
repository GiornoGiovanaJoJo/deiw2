import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Package, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function ProjectMaterials({ projectId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, [projectId]);

    const loadLogs = async () => {
        try {
            // Fetch all product logs and filter by project_id
            // Ideally backend should support filtering by project_id directly
            // Assuming endpoint exists or we filter clientside for now
            const res = await clientApi.getProductLogs();
            // Filter
            const projectLogs = res.data.filter(log => log.project_id === parseInt(projectId));
            setLogs(projectLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("Failed to load product logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'Auslagerung': return <Badge className="bg-orange-100 text-orange-700"><ArrowUpRight className="w-3 h-3 mr-1" /> Auslagerung</Badge>;
            case 'Einlagerung': return <Badge className="bg-green-100 text-green-700"><ArrowDownLeft className="w-3 h-3 mr-1" /> Rückgabe</Badge>;
            default: return <Badge variant="outline">{action}</Badge>;
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Laden...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-500" />
                        Materialjournal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            Keine Materialbewegungen für dieses Projekt gefunden.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Aktion</TableHead>
                                    <TableHead>Artikel</TableHead>
                                    <TableHead>Menge</TableHead>
                                    <TableHead>Benutzer</TableHead>
                                    <TableHead>Notiz</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium text-slate-600">
                                            {format(new Date(log.created_date), 'dd.MM.yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>{getActionBadge(log.action)}</TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-900">{log.product_name}</span>
                                        </TableCell>
                                        <TableCell>
                                            {log.quantity}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {log.user_name ? log.user_name.charAt(0) : '?'}
                                                </div>
                                                <span className="text-sm">{log.user_name || 'Unbekannt'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 italic text-sm">
                                            {log.note || '-'}
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
