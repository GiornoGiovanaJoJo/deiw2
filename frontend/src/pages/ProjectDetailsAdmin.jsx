import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Coins, Users, User, FileText, Layers, Edit, Building2, Send, MessageSquare, Image, Plus, Trash2, X } from "lucide-react";
import ProjectStages from "@/components/project/ProjectStages";
import ProjectDocuments from "@/components/project/ProjectDocuments";
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Input } from "@/components/ui/input";
import ProjectModal from "@/components/ProjectModal";

export default function ProjectDetailsAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const { user } = useAuth();

    // Chat States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (activeTab === 'chat') {
            loadMessages();
        }
    }, [activeTab]);

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
            // Admin sending message in project chat.
            // Recipient? The user (customer).
            // If project.customer_id is set, use that user_id?
            // Wait, Customer model links to User via email usually, or we need to find the User ID of the customer.
            // Project has customer_id (int). Customer has email. User has email.
            // We need to find User ID by email or if Customer has user_id.
            // Models: Customer doesn't seem to have user_id derived directly in frontend Project object?
            // We used `create_user_open` which makes User and Customer.
            // If we didn't store user_id in Customer, we assume email match.
            // Admin message recipient is arguably the Client User.
            // Let's rely on backend: if project_id is set, maybe recipient_id is less distinct if it's a "room"?
            // But our model enforces recipient_id.
            // We need to know who we are talking to.
            // Determine recipient: Project Customer?
            // If project has customer, we need their User ID.
            // Limitation: We might not have User ID of customer in `project` response easily if not joined.
            // Let's assume for now we can get it or we broadcast?
            // "project_id" in message might allow recipient_id to be null in future, but schema says int.
            // Let's try to find the User who owns this project (Customer).
            // Backend `read_project` includes `customer`. `Customer` has `email`.
            // We might need to look up User by email or assume we can reply to the last message sender if exists.

            // Fallback: If messages exist, reply to the other person.
            // If no messages, we need to know who to start with.
            // For now, let's try to get it from `project.customer`. 
            // We might need `clientApi.getUserByEmail(project.customer.email)` or similar?
            // Or `project` might include `customer_user_id` if we modify return.

            // Simplest hack: Reply to `messages[0].sender_id` if `messages[0].sender_id != user.id`.

            let recipientId = null;
            if (messages.length > 0) {
                const otherMsg = messages.find(m => m.sender_id !== user.id);
                if (otherMsg) recipientId = otherMsg.sender_id;
            }

            // If no messages yet, Admin cannot start chat easily without knowing User ID.
            // This is a known limitation request.
            // Let's add a TODO or alert if unknown.

            if (!recipientId && project.customer) {
                // Try to find user by customer email? Not available in clientApi yet.
                // Assuming we can't send.
                alert("Kann keine Nachricht senden: Empfänger nicht gefunden (Keine vorherigen Nachrichten).");
                return;
            }

            if (!recipientId) return;

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

    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const uploadRes = await clientApi.uploadImage(file);
            const imageUrl = uploadRes.data.url;

            await clientApi.updateProject(id, { main_image: imageUrl });
            setProject(prev => ({ ...prev, main_image: imageUrl }));
        } catch (error) {
            console.error("Failed to upload main image", error);
            alert("Fehler beim Hochladen des Bildes");
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const newPhotos = [];
            for (const file of files) {
                const uploadRes = await clientApi.uploadImage(file);
                newPhotos.push(uploadRes.data.url);
            }

            const updatedPhotos = [...(project.photos || []), ...newPhotos];
            await clientApi.updateProject(id, { photos: updatedPhotos });
            setProject(prev => ({ ...prev, photos: updatedPhotos }));
        } catch (error) {
            console.error("Failed to upload gallery images", error);
            alert("Fehler beim Hochladen der Bilder");
        }
    };

    const removeGalleryImage = async (indexToRemove) => {
        if (!confirm("Bild wirklich löschen?")) return;

        try {
            const updatedPhotos = project.photos.filter((_, index) => index !== indexToRemove);
            await clientApi.updateProject(id, { photos: updatedPhotos });
            setProject(prev => ({ ...prev, photos: updatedPhotos }));
        } catch (error) {
            console.error("Failed to remove image", error);
        }
    };

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const response = await clientApi.getProjectById(id);
            setProject(response.data);
        } catch (error) {
            console.error("Failed to load project", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Laden...</div>;
    if (!project) return <div className="p-6 text-center">Projekt nicht gefunden</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/projects">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {project.projekt_nummer && <span className="text-slate-400 font-mono text-lg">{project.projekt_nummer}</span>}
                            {project.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline">{project.status}</Badge>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{project.priority}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Bearbeiten
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {['overview', 'stages', 'documents', 'team', 'media', 'chat'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                            `}
                        >
                            {tab === 'overview' && 'Übersicht'}
                            {tab === 'stages' && 'Phasen & Zeitplan'}
                            {tab === 'documents' && 'Dokumente'}
                            {tab === 'team' && 'Team & Partner'}
                            {tab === 'media' && 'Fotos & Medien'}
                            {tab === 'chat' && 'Kommunikation'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Beschreibung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 whitespace-pre-wrap">{project.description || "Keine Beschreibung vorhanden."}</p>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Standort</p>
                                            <p className="text-slate-500 text-sm">{project.address || "Keine Adresse"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Zeitraum</p>
                                            <p className="text-slate-500 text-sm">
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                                                {' bis '}
                                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Coins className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Budget</p>
                                            <p className="text-slate-500 text-sm">
                                                {project.budget ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(project.budget) : '0,00 €'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Kunde</CardTitle></CardHeader>
                                <CardContent>
                                    {project.customer ? (
                                        <div className="space-y-2">
                                            <p className="font-medium">{project.customer.type === 'Firma' ? project.customer.company_name : project.customer.contact_person}</p>
                                            <p className="text-sm text-slate-500">{project.customer.email}</p>
                                            <p className="text-sm text-slate-500">{project.customer.phone}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">Kein Kunde zugewiesen</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'stages' && (
                    <ProjectStages projectId={id} />
                )}

                {activeTab === 'documents' && (
                    <ProjectDocuments projectId={id} />
                )}

                {activeTab === 'media' && (
                    <div className="space-y-8">
                        {/* Main Image */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Hauptbild</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="main-image-upload"
                                        onChange={handleMainImageUpload}
                                    />
                                    <label htmlFor="main-image-upload">
                                        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                            <span><Edit className="w-4 h-4 mr-2" /> Ändern</span>
                                        </Button>
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {project.main_image ? (
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border max-w-2xl">
                                        <img src={project.main_image} alt="Main" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-lg bg-slate-50 border border-dashed flex items-center justify-center text-slate-400 max-w-2xl">
                                        <div className="text-center">
                                            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Kein Hauptbild vorhanden</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Gallery */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Galerie</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        id="gallery-upload"
                                        onChange={handleGalleryUpload}
                                    />
                                    <label htmlFor="gallery-upload">
                                        <Button size="sm" className="cursor-pointer" asChild>
                                            <span><Plus className="w-4 h-4 mr-2" /> Fotos hinzufügen</span>
                                        </Button>
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!project.photos || project.photos.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">Keine Fotos in der Galerie.</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {project.photos.map((photo, index) => (
                                            <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-100">
                                                <img src={photo} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => removeGalleryImage(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'team' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Projektteam</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Projektleitung
                                </h3>
                                {project.projektleiter ? (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {project.projektleiter.first_name[0]}{project.projektleiter.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">{project.projektleiter.first_name} {project.projektleiter.last_name}</p>
                                            <p className="text-xs text-slate-500">{project.projektleiter.email}</p>
                                        </div>
                                    </div>
                                ) : <p className="text-slate-500 text-sm">Nicht zugewiesen</p>}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Gruppenleiter
                                </h3>
                                <div className="space-y-2">
                                    {project.gruppenleiter && project.gruppenleiter.length > 0 ? (
                                        project.gruppenleiter.map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                <span className="text-sm">{u.first_name} {u.last_name}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Gruppenleiter</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Mitarbeiter (Worker)
                                </h3>
                                <div className="space-y-2">
                                    {project.workers && project.workers.length > 0 ? (
                                        project.workers.map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                <span className="text-sm">{u.first_name} {u.last_name}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Mitarbeiter</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Subunternehmer
                                </h3>
                                <div className="space-y-2">
                                    {project.subcontractors && project.subcontractors.length > 0 ? (
                                        project.subcontractors.map(s => (
                                            <div key={s.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                                                    {s.company_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{s.company_name}</p>
                                                    <p className="text-xs text-slate-500">{s.contact_person}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500 text-sm">Keine Subunternehmer</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'chat' && (
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <CardTitle>Projekt-Kommunikation</CardTitle>
                                    <p className="text-xs text-slate-500">Chatverlauf für dieses Projekt</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-400 py-10">
                                        Keine Nachrichten vorhanden.
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
    );
}


