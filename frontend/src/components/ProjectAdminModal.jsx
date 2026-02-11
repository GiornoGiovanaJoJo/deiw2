import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Plus, Trash2, Edit, FileText, MessageSquare, Send, X } from "lucide-react";
import ProjectDocuments from "@/components/project/ProjectDocuments";
import { clientApi } from '@/api/client';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export default function ProjectAdminModal({ isOpen, onClose, project: initialProject, onUpdate }) {
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState("media");
    const { user } = useAuth();

    // Chat States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    useEffect(() => {
        if (isOpen && activeTab === 'chat' && project) {
            loadMessages();
        }
    }, [isOpen, activeTab, project]);

    const loadMessages = async () => {
        if (!project) return;
        try {
            const response = await clientApi.getMessages(project.id);
            setMessages(response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            scrollToBottom();
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !project) return;

        try {
            // Logic to find recipient similar to ProjectDetailsAdmin
            let recipientId = null;
            if (messages.length > 0) {
                const otherMsg = messages.find(m => m.sender_id !== user.id);
                if (otherMsg) recipientId = otherMsg.sender_id;
            }

            if (!recipientId && project.customer) {
                // Determine recipient? For now alert if unknown
                // Ideally we'd map customer to user_id or have backend handle it
            }

            if (!recipientId) {
                // Try to fallback or alert
                // For now, let's assume we can reply if there's history.
                // If no history, we might be stuck until customer initiates or we fix backend to allow messaging project owners easily.
                if (messages.length === 0) {
                    alert("Kann keine Nachricht senden: Empfänger nicht eindeutig (Warte auf Nachricht vom Kunden).");
                    return;
                }
            }

            if (recipientId) {
                const res = await clientApi.sendMessage({
                    recipient_id: recipientId,
                    project_id: project.id,
                    content: newMessage
                });
                setMessages(prev => [...prev, res.data]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !project) return;

        try {
            const uploadRes = await clientApi.uploadImage(file);
            const imageUrl = uploadRes.data.url;

            await clientApi.updateProject(project.id, { main_image: imageUrl });
            setProject(prev => ({ ...prev, main_image: imageUrl }));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to upload main image", error);
            alert("Fehler beim Hochladen des Bildes");
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || !project) return;

        try {
            const newPhotos = [];
            for (const file of files) {
                const uploadRes = await clientApi.uploadImage(file);
                newPhotos.push(uploadRes.data.url);
            }

            const updatedPhotos = [...(project.photos || []), ...newPhotos];
            await clientApi.updateProject(project.id, { photos: updatedPhotos });
            setProject(prev => ({ ...prev, photos: updatedPhotos }));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to upload gallery images", error);
            alert("Fehler beim Hochladen der Bilder");
        }
    };

    const removeGalleryImage = async (indexToRemove) => {
        if (!confirm("Bild wirklich löschen?") || !project) return;

        try {
            const updatedPhotos = project.photos.filter((_, index) => index !== indexToRemove);
            await clientApi.updateProject(project.id, { photos: updatedPhotos });
            setProject(prev => ({ ...prev, photos: updatedPhotos }));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to remove image", error);
        }
    };

    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-3">
                        Verwalten: {project.name}
                        <Badge variant="outline">{project.projekt_nummer}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex border-b px-6">
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2"><Image className="w-4 h-4" /> Fotos & Medien</div>
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Dokumente</div>
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Kommunikation</div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {activeTab === 'media' && (
                        <div className="space-y-8">
                            {/* Main Image */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between py-4">
                                    <CardTitle className="text-base">Hauptbild</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="modal-main-image-upload"
                                            onChange={handleMainImageUpload}
                                        />
                                        <label htmlFor="modal-main-image-upload">
                                            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                                <span><Edit className="w-4 h-4 mr-2" /> Ändern</span>
                                            </Button>
                                        </label>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {project.main_image ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border max-w-xl mx-auto">
                                            <img src={project.main_image} alt="Main" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video rounded-lg bg-slate-50 border border-dashed flex items-center justify-center text-slate-400 max-w-xl mx-auto">
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
                                <CardHeader className="flex flex-row items-center justify-between py-4">
                                    <CardTitle className="text-base">Galerie</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            id="modal-gallery-upload"
                                            onChange={handleGalleryUpload}
                                        />
                                        <label htmlFor="modal-gallery-upload">
                                            <Button size="sm" className="cursor-pointer" asChild>
                                                <span><Plus className="w-4 h-4 mr-2" /> Fotos hinzufügen</span>
                                            </Button>
                                        </label>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!project.photos || project.photos.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">Keine Fotos в галерее.</p>
                                    ) : (
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                            {project.photos.map((photo, index) => (
                                                <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-100">
                                                    <img src={photo} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
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

                    {activeTab === 'documents' && (
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <ProjectDocuments projectId={project.id} />
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <Card className="h-full flex flex-col shadow-none border-0 bg-transparent">
                            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg border shadow-sm">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.length === 0 && (
                                        <div className="text-center text-slate-400 py-10">
                                            Keine Nachrichten vorhanden.
                                        </div>
                                    )}
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-[#7C3AED] text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
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

                                <div className="p-3 bg-slate-50 border-t">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
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
                            </div>
                        </Card>
                    )}
                </div>
                <DialogFooter className="px-6 py-4 border-t bg-slate-50">
                    <Button onClick={onClose}>Schließen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
