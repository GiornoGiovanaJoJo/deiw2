import React, { useState, useEffect } from 'react';
import { clientApi } from "@/api/client";
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Plus, Send } from "lucide-react";
import { format } from 'date-fns';

export default function Support() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Reply/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');

    // New Ticket Modal
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        sender_name: '',
        sender_email: '',
        priority: 'Mittel',
        category: 'Anfrage'
    });

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const response = await clientApi.getTickets();
            setTickets(response.data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReply = (ticket) => {
        setSelectedTicket(ticket);
        setReplyText(ticket.response || '');
        setIsModalOpen(true);
    };

    const handleSendReply = async () => {
        try {
            await clientApi.updateTicket(selectedTicket.id, {
                response: replyText,
                status: 'Beantwortet'
            });
            setIsModalOpen(false);
            loadTickets();
        } catch (error) {
            console.error("Failed to send reply", error);
            alert("Fehler beim Senden der Antwort.");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await clientApi.createTicket(newTicket);
            setIsNewTicketOpen(false);
            setNewTicket({
                subject: '',
                message: '',
                sender_name: '',
                sender_email: '',
                priority: 'Mittel',
                category: 'Anfrage'
            });
            loadTickets();
        } catch (error) {
            console.error("Failed to create ticket", error);
            alert("Fehler beim Erstellen des Tickets.");
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Neu': 'bg-blue-100 text-blue-800',
            'In Bearbeitung': 'bg-yellow-100 text-yellow-800',
            'Beantwortet': 'bg-green-100 text-green-800',
            'Geschlossen': 'bg-slate-100 text-slate-800'
        };
        return <Badge className={colors[status] || 'bg-slate-100'}>{status}</Badge>;
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.sender_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Laden...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Support & Anfragen</h1>
                    <p className="text-slate-500">Verwaltung von Kundenanfragen und Tickets</p>
                </div>
                <Button onClick={() => setIsNewTicketOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Neue Anfrage erstellen
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Suche nach Betreff, Name, Email..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">Alle Status</SelectItem>
                                <SelectItem value="Neu">Neu</SelectItem>
                                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                                <SelectItem value="Beantwortet">Beantwortet</SelectItem>
                                <SelectItem value="Geschlossen">Geschlossen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Betreff</TableHead>
                                <TableHead>Leistung & Termin</TableHead>
                                <TableHead>Absender</TableHead>
                                <TableHead>Erstellt am</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>{ticket.subject}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[300px]">{ticket.message}</div>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] h-5">{ticket.category}</Badge>
                                            {ticket.source && <Badge variant="secondary" className="text-[10px] h-5">{ticket.source}</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{ticket.service_id || '-'}</div>
                                        <div className="text-xs text-slate-500">
                                            {ticket.booking_date ? format(new Date(ticket.booking_date), 'dd.MM.yyyy') : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{ticket.sender_name}</div>
                                        <div className="text-xs text-slate-500">{ticket.sender_email}</div>
                                        <div className="text-xs text-slate-500">{ticket.sender_phone}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {ticket.created_date ? format(new Date(ticket.created_date), 'dd.MM.yyyy HH:mm') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenReply(ticket)}>
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Antworten
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reply Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ticket bearbeiten: {selectedTicket?.subject}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-md">
                            <p className="font-semibold text-sm mb-1">Nachricht von {selectedTicket?.sender_name}:</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTicket?.message}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Antwort / Notiz</Label>
                            <Textarea
                                rows={6}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Geben Sie hier Ihre Antwort ein..."
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Label>Status ändern:</Label>
                                <Select
                                    defaultValue={selectedTicket?.status}
                                    onValueChange={async (val) => {
                                        await clientApi.updateTicket(selectedTicket.id, { status: val });
                                        setSelectedTicket({ ...selectedTicket, status: val });
                                        loadTickets();
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Neu">Neu</SelectItem>
                                        <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                                        <SelectItem value="Beantwortet">Beantwortet</SelectItem>
                                        <SelectItem value="Geschlossen">Geschlossen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSendReply}>
                            <Send className="w-4 h-4 mr-2" /> Speichern & Senden
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Ticket Modal */}
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neue Anfrage erfassen</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Betreff *</Label>
                            <Input
                                required
                                value={newTicket.subject}
                                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name Absender</Label>
                                <Input
                                    value={newTicket.sender_name}
                                    onChange={e => setNewTicket({ ...newTicket, sender_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Absender</Label>
                                <Input
                                    type="email"
                                    value={newTicket.sender_email}
                                    onChange={e => setNewTicket({ ...newTicket, sender_email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nachricht *</Label>
                            <Textarea
                                required
                                rows={4}
                                value={newTicket.message}
                                onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priorität</Label>
                                <Select
                                    value={newTicket.priority}
                                    onValueChange={val => setNewTicket({ ...newTicket, priority: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Niedrig">Niedrig</SelectItem>
                                        <SelectItem value="Mittel">Mittel</SelectItem>
                                        <SelectItem value="Hoch">Hoch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Kategorie</Label>
                                <Select
                                    value={newTicket.category}
                                    onValueChange={val => setNewTicket({ ...newTicket, category: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Anfrage">Anfrage</SelectItem>
                                        <SelectItem value="Reklamation">Reklamation</SelectItem>
                                        <SelectItem value="Support">Support</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Erstellen</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
