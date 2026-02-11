import React, { useState, useEffect, useRef } from 'react';
import { clientApi } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Send, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectChat({ projectId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const loadMessages = async () => {
        try {
            const res = await clientApi.getComments('project', projectId);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [projectId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            const payload = {
                entity_type: 'project',
                entity_id: projectId,
                content: newMessage,
                user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Guest',
                user_id: user?.id?.toString()
            };
            await clientApi.createComment(payload);
            setNewMessage('');
            loadMessages();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col shadow-none border-0">
            <CardHeader className="px-0">
                <CardTitle className="text-xl">Kommunikation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-lg space-y-4">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-slate-400 py-10">
                        Noch keine Nachrichten. Schreiben Sie die erste Nachricht!
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.user_id === user?.id?.toString();
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                                <div className="flex items-center gap-2 mb-1 opacity-80 text-xs">
                                    <span className="font-bold">{msg.user_name}</span>
                                    <span>{format(new Date(msg.created_date), 'dd.MM HH:mm')}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-0 pt-4 gap-2">
                <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Schreiben Sie eine Nachricht..."
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button onClick={handleSend} className="h-auto px-6">
                    <Send className="w-5 h-5" />
                </Button>
            </CardFooter>
        </Card>
    );
}
