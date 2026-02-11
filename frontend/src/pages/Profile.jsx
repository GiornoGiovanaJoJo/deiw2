import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Search, Settings, FileText, HelpCircle, Send } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { clientApi } from '@/api/client'; // New client API
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import './Home.css';
import { format } from 'date-fns';

export default function Profile() {
    const { user, logout, checkUserAuth } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    // Data States
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chat States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '' // Only for confirmation ideally, or omitted if not changing password
    });

    useEffect(() => {
        if (user) {
            // Admin redirect logic could go here if checking user.is_superuser
            if (user.is_superuser) {
                // return navigate('/dashboard'); // If we had dashboard
            }

            loadClientData();
            setProfileForm({
                first_name: user.full_name ? user.full_name.split(' ')[0] : (user.first_name || ''),
                last_name: user.full_name ? user.full_name.split(' ').slice(1).join(' ') : (user.last_name || ''),
                email: user.email || '',
                password: ''
            });

            if (activeTab === 'support') {
                loadMessages();
            }
        }
    }, [user, navigate, activeTab]);

    const loadClientData = async () => {
        try {
            setLoading(true);
            const [myProjects] = await Promise.all([
                clientApi.getMyProjects(true) // Pass true to filter by owner/assignment
            ]);
            setOrders(myProjects.data || []);
            setRequests([]); // clientApi.getMyRequests() is not implemented yet
        } catch (error) {
            console.error("Failed to load client data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const res = await clientApi.getMessages();
            // Sort by timestamp asc
            const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(sorted);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Helper to determine recipient. For a user, they message the 'System' or 'Support'.
            // Current backend implementation of sendMessage takes recipient_id.
            // We need a way to know WHO is the support admin.
            // For now, let's assume Admin ID is 1 or we need a specific 'Support' user.
            // OR we can make the backend handle 'support' keyword?
            // Let's assume ID 1 is the main admin for now.
            // TODO: Better way to find support admin ID.
            const ADMIN_ID = 1;

            await clientApi.sendMessage({
                recipient_id: ADMIN_ID,
                content: newMessage
            });
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Fehler beim Senden der Nachricht.");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleUpdateProfile = async () => {
        // In a real app we might require password confirmation, but for now we skip strict check or assume it's passed differently
        try {
            const payload = {
                email: profileForm.email,
                first_name: profileForm.first_name, // Backend expects first_name
                last_name: profileForm.last_name,
                // password: profileForm.password // Only send if changing
            };

            await clientApi.updateProfile(payload);
            await checkUserAuth(); // Refresh global user state
            setIsEditingProfile(false);
            setProfileForm(prev => ({ ...prev, password: '' }));
        } catch (error) {
            console.error("Profile update failed", error);
            alert("Произошла ошибка при обновлении профиля");
        }
    };

    if (!user) {
        // You might redirect here or show loading
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                Загрузка профиля...
            </div>
        );
    }

    // Admin check could also happen here to render different UI

    // Client View Logic
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        const matchesCategory = categoryFilter ? order.category?.name === categoryFilter : true;
        const matchesSearch = searchTerm ?
            (order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.project_code && order.project_code.toLowerCase().includes(searchTerm.toLowerCase()))) : true;
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === id
                ? 'bg-white border-2 border-[#7C3AED] text-[#7C3AED] shadow-sm font-medium'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="landing-page min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
            <Header />
            <div className="container mx-auto px-4 !pt-24 !pb-8 lg:!pt-32 lg:!pb-12 flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-80 shrink-0 space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left pl-4">
                        <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.full_name || `${user.first_name || 'User'} ${user.last_name || ''}`}</h2>
                        <p className="text-slate-400 text-sm mt-1">ID {user.id}</p>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem id="orders" icon={FileText} label="Заказы" />
                        <SidebarItem id="requests" icon={FileText} label="Заявки" />
                        <SidebarItem id="profile" icon={Settings} label="Управление профилем" />
                        <SidebarItem id="support" icon={HelpCircle} label="Поддержка" />
                    </nav>

                    <div className="pt-8 border-t border-slate-100">
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 pl-4 text-sm font-medium">
                            <LogOut className="w-4 h-4" /> Выйти
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {activeTab === 'orders' && (
                        <div className="space-y-8">
                            <h1 className="text-3xl font-bold text-slate-900">Заказы</h1>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select
                                    className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Статус заказа</option>
                                    <option value="In Bearbeitung">В работе</option>
                                    <option value="Abgeschlossen">Завершен</option>
                                    <option value="Geplant">Geplant</option>
                                </select>
                                <select
                                    className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Категория услуги</option>
                                    <option value="Sanitaire">Сантехника</option>
                                    <option value="Renovation">Ремонт</option>
                                </select>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Поиск по номеру заказа"
                                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-[#7C3AED]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Order List */}
                            <div className="space-y-4">
                                {loading && <div className="text-center py-8 text-slate-500">Загрузка...</div>}
                                {!loading && filteredOrders.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">Заказов не найдено.</div>
                                )}
                                {filteredOrders.map((order) => (
                                    <div key={order.id} onClick={() => navigate(`/my-projects/${order.id}`)} className="bg-[#F8F7FF] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="space-y-4 flex-1">
                                            <div className="font-bold text-slate-900 text-lg">{order.status}</div>
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 mb-2">{order.name}</h3>
                                                <div className="text-slate-500 text-sm space-y-1">
                                                    <p>Категория заказа: {order.category?.name || "Общее"}</p>
                                                    <p>Номер заказа: {order.projekt_nummer || order.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-32 h-24 bg-slate-200 rounded-xl shrink-0" style={{ backgroundColor: order.color || '#e2e8f0' }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl">
                            <h1 className="text-3xl font-bold text-slate-900">Управление профилем</h1>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <button className="text-[#7C3AED] hover:underline text-sm font-medium">
                                        Изменить фото
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Имя</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.first_name}
                                                onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.first_name}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Фамилия</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.last_name}
                                                onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.last_name}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Email</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.email}
                                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.email}</span>
                                        )}
                                    </div>

                                    {/* Password field logic simplified for MVP */}

                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="text-slate-400 text-sm">ID {user.id}</span>
                                    </div>
                                </div>

                                {isEditingProfile ? (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="flex-1 h-12 rounded-xl bg-[#7C3AED] text-white font-medium hover:bg-[#6D28D9] transition-colors"
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="w-full h-12 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-violet-50 transition-colors"
                                    >
                                        Редактировать
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">История заявок</h2>
                            {requests.length === 0 ? (
                                <p className="text-slate-500 text-center py-20">У вас пока нет активных заявок.</p>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-slate-900">{req.reason}</h3>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${req.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-4">{req.message}</p>
                                            <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="space-y-8 h-[600px] flex flex-col">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">Чат с поддержкой</h2>
                                <a href="mailto:support@empire-premium.de" className="text-sm text-slate-500 hover:text-[#7C3AED]">
                                    Alternative: Email
                                </a>
                            </div>

                            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                {/* Chat Area */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                                    {messages.length === 0 && (
                                        <div className="text-center text-slate-400 py-10">
                                            Напишите нам, если у вас возникли вопросы.
                                        </div>
                                    )}
                                    {messages.map((msg) => {
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

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-3">
                                        <Input
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Введите сообщение..."
                                            className="flex-1"
                                        />
                                        <Button type="submit" size="icon" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
