import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, MapPin, Send, MessageSquare, Layers, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from 'date-fns';
import ProjectStages from "@/components/project/ProjectStages";
import ProjectDocuments from "@/components/project/ProjectDocuments";

export default function ProjectDetailsUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Chat States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'chat') {
            loadMessages();
        }
    }, [activeTab]);

    const loadProject = async () => {
        try {
            const response = await clientApi.getProjectById(id);
            setProject(response.data);
        } catch (error) {
            console.error("Failed to load project", error);
            alert("Fehler beim Laden des Projekts");
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await clientApi.getMessages(id);
            setMessages(response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            scrollToBottom();
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const recipientId = project.projektleiter_id || 1;

            const res = await clientApi.sendMessage({
                recipient_id: recipientId,
                project_id: parseInt(id),
                content: newMessage
            });

            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading) return <div className="p-8 text-center">Laden...</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 landing-page flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 !pt-32 lg:!pt-40 pb-16">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hover:bg-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {project.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="bg-white border-slate-300">{project.status}</Badge>
                                {project.projekt_nummer && <span className="text-slate-500 font-mono text-sm">{project.projekt_nummer}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 px-5 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Übersicht
                        </button>
                        <button
                            onClick={() => setActiveTab('stages')}
                            className={`py-3 px-5 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'stages' ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            <Layers className="w-4 h-4" /> Phasen
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`py-3 px-5 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'documents' ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            <FileText className="w-4 h-4" /> Dokumente
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`py-3 px-5 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'chat' ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Chat zum Auftrag
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-w-5xl mx-auto lg:mx-0">
                        {activeTab === 'overview' && (
                            <div className="grid gap-8 md:grid-cols-3">
                                <Card className="md:col-span-2 shadow-sm border-slate-200">
                                    <CardHeader><CardTitle>Beschreibung</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{project.description || "Keine Beschreibung verfügbar."}</p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-6">
                                    <Card className="shadow-sm border-slate-200">
                                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-slate-900">Standort</p>
                                                    <p className="text-slate-500 text-sm">{project.address || "Keine Adresse"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-slate-900">Zeitraum</p>
                                                    <p className="text-slate-500 text-sm">
                                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                                                        {' bis '}
                                                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stages' && (
                            <ProjectStages projectId={id} readOnly={true} />
                        )}

                        {activeTab === 'documents' && (
                            <ProjectDocuments projectId={id} />
                        )}

                        {activeTab === 'chat' && (
                            <Card className="h-[600px] flex flex-col shadow-sm border-slate-200">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <CardTitle>Projekt-Chat</CardTitle>
                                            <p className="text-xs text-slate-500">Direkter Draht zu Ihrem Projektleiter</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                                        {messages.length === 0 && (
                                            <div className="text-center text-slate-400 py-10">
                                                Hier können Sie Fragen zu diesem Auftrag stellen.
                                            </div>
                                        )}
                                        {messages.map((msg) => {
                                            const isMe = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-[#7C3AED] text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-violet-200' : 'text-slate-400'}`}>
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
                                                placeholder="Nachricht schreiben..."
                                                className="flex-1"
                                                autoFocus
                                            />
                                            <Button type="submit" size="icon" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
