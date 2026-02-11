import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Mail, Phone, Calendar, User, MessageSquare } from "lucide-react";
import { format } from 'date-fns';

export default function Requests() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const res = await clientApi.getTickets();
            // Sort by Date Descending
            setTickets(res.data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async (ticket) => {
        if (!confirm("Möchten Sie diese Anfrage wirklich in ein Projekt umwandeln?")) return;

        setConverting(true);
        try {
            await clientApi.convertTicketToProject(ticket.id);
            // Refresh list
            await loadTickets();
            if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
            alert("Projekt wurde erfolgreich erstellt!");
        } catch (error) {
            console.error("Failed to convert ticket", error);
            alert("Fehler bei der Umwandlung.");
        } finally {
            setConverting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Neu': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Neu</Badge>;
            case 'In Bearbeitung': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">In Bearbeitung</Badge>;
            case 'Geschlossen': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Geschlossen</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Anfragen</h1>
                    <p className="text-slate-500">Verwalten Sie eingehende Support-Tickets und Projektanfragen</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Eingang</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            Keine Anfragen vorhanden.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Betreff</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead>Quelle</TableHead>
                                    <TableHead>Datum</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedTicket(ticket)}>
                                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                        <TableCell className="font-medium">
                                            {ticket.subject}
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.message}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="font-semibold">{ticket.sender_name}</span>
                                                <span className="text-slate-500">{ticket.sender_email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                {ticket.source === 'service_modal' ? 'Service Modal' :
                                                    ticket.source === 'home_form' ? 'Kontaktformular' : ticket.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {format(new Date(ticket.created_date), 'dd.MM.yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {selectedTicket?.subject}
                            {selectedTicket && getStatusBadge(selectedTicket.status)}
                        </DialogTitle>
                        <DialogDescription>
                            Eingegangen am {selectedTicket && format(new Date(selectedTicket.created_date), 'dd.MM.yyyy HH:mm')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><User className="w-3 h-3" /> Name</p>
                                    <p>{selectedTicket.sender_name || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                                    <p>{selectedTicket.sender_email || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</p>
                                    <p>{selectedTicket.sender_phone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Wunschtermin</p>
                                    <p>{selectedTicket.booking_date ? format(new Date(selectedTicket.booking_date), 'dd.MM.yyyy') : '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Nachricht</p>
                                <div className="bg-slate-50 p-4 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            {selectedTicket.response && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm">
                                    <p className="font-semibold text-green-800 mb-1">Antwort / Status Update:</p>
                                    <p className="text-green-700">{selectedTicket.response}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedTicket?.status !== 'Geschlossen' && (
                            <Button
                                onClick={() => handleConvert(selectedTicket)}
                                disabled={converting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                In Projekt umwandeln
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setSelectedTicket(null)}>Schließen</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
