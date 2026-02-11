import React, { useState, useEffect, useRef } from 'react';
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
import { Search, MessageSquare, Plus, Send, User } from "lucide-react";
import { format } from 'date-fns';

export default function Support() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'chat'

    // Chat States
    const [conversations, setConversations] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

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
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tickets') {
                const response = await clientApi.getTickets();
                setTickets(response.data);
            } else if (activeTab === 'chat') {
                const response = await clientApi.getMessages();
                processConversations(response.data);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const processConversations = (messages) => {
        const grouped = {};
        messages.forEach(msg => {
            // Determine the "other" user ID
            const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
            if (!grouped[otherId]) {
                grouped[otherId] = {
                    userId: otherId,
                    messages: [],
                    lastMessage: null,
                    // We don't have user details here easily without another fetch or join. 
                    // For now validation relies on what we have. 
                    // Ideally backend returns User object with message.
                    // Assuming we can get name from a separate call or list.
                    name: `User ${otherId}`
                };
            }
            grouped[otherId].messages.push(msg);
        });

        // Sort messages in each conversation
        Object.values(grouped).forEach(group => {
            group.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            group.lastMessage = group.messages[group.messages.length - 1];
        });

        setConversations(grouped);
    };

    const handleSelectConversation = async (userId) => {
        setSelectedUser(userId);
        // Ensure we have the latest for this user (though we loaded all already)
        // We could also call getConversation(userId) to be sure
        const msgs = conversations[userId]?.messages || [];
        setChatMessages(msgs);
        setTimeout(scrollToBottom, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const res = await clientApi.sendMessage({
                recipient_id: selectedUser,
                content: newMessage
            });

            // Optimistic update
            const newMsg = res.data; // Assuming backend returns the created message object
            setChatMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            scrollToBottom();

            // Update conversation list as well
            setConversations(prev => {
                const updated = { ...prev };
                if (!updated[selectedUser]) {
                    updated[selectedUser] = { userId: selectedUser, messages: [], name: `User ${selectedUser}` };
                }
                updated[selectedUser].messages.push(newMsg);
                updated[selectedUser].lastMessage = newMsg;
                return updated;
            });

        } catch (error) {
            console.error("Failed to send message", error);
            // alert("Fehler beim Senden der Nachricht.");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            loadData();
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
            loadData();
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Support & Anfragen</h1>
                    <p className="text-slate-500">Verwaltung von Kundenanfragen und Tickets</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'tickets' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Live Support Chat
                        </button>
                    </div>
                    {activeTab === 'tickets' && (
                        <Button onClick={() => setIsNewTicketOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Neue Anfrage
                        </Button>
                    )}
                </div>
            </div>

            {activeTab === 'tickets' && (
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
                        {loading ? <div className="p-8 text-center text-slate-500">Laden...</div> : (
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
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenReply(ticket)}>
                                                        <MessageSquare className="w-4 h-4 mr-2" />
                                                        Antworten
                                                    </Button>
                                                    {ticket.status !== 'Geschlossen' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                if (confirm('Möchten Sie dieses Ticket wirklich in ein Projekt umwandeln?')) {
                                                                    try {
                                                                        await clientApi.convertTicketToProject(ticket.id);
                                                                        alert('Ticket erfolgreich in Projekt umgewandelt!');
                                                                        loadData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('Fehler bei der Umwandlung.');
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            In Projekt umwandeln
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'chat' && (
                <div className="flex h-[700px] gap-6">
                    {/* Sidebar / Conversation List */}
                    <Card className="w-1/3 flex flex-col">
                        <CardHeader>
                            <CardTitle>Aktive Chats</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-2 p-2">
                            {Object.values(conversations).length === 0 && <div className="text-center text-slate-500 p-4">Keine Nachrichten</div>}
                            {Object.values(conversations).map(chat => (
                                <div
                                    key={chat.userId}
                                    onClick={() => handleSelectConversation(chat.userId)}
                                    className={`p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border ${selectedUser === chat.userId ? 'border-[#7C3AED] bg-violet-50' : 'border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-semibold text-slate-900">{chat.name}</h4>
                                            <p className="text-xs text-slate-500 truncate">
                                                {chat.lastMessage?.content || 'Keine Nachrichten'}
                                            </p>
                                        </div>
                                        {chat.lastMessage && (
                                            <span className="text-[10px] text-slate-400">
                                                {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <Card className="flex-1 flex flex-col">
                        {selectedUser ? (
                            <>
                                <CardHeader className="border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <CardTitle>Chat mit {conversations[selectedUser]?.name}</CardTitle>
                                            <p className="text-xs text-slate-500">ID: {selectedUser}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                                        {chatMessages.map((msg) => {
                                            const isMe = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-[#7C3AED] text-white' : 'bg-white border border-slate-200'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-violet-200' : 'text-slate-400'}`}>
                                                            {format(new Date(msg.timestamp), 'dd.MM.yyyy HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="p-4 bg-white border-t border-slate-100">
                                        <form onSubmit={handleSendMessage} className="flex gap-3">
                                            <Input
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder="Antworten..."
                                                className="flex-1"
                                            />
                                            <Button type="submit" size="icon" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                Wählen Sie einen Chat aus, um zu beginnen.
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Existing Modals ... (Reply Modal, New Ticket Modal) ... can stay below */}
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
                                        loadData();
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
