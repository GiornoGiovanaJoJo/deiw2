import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Box,
    ClipboardList,
    LogOut,
    Menu,
    X,
    FileText,
    Settings,
    Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Projektleiter', 'Gruppenleiter', 'Büro', 'Worker'] },
        { name: 'Users', path: '/users', icon: Users, roles: ['Admin'] },
        { name: 'Projects', path: '/projects', icon: Briefcase, roles: ['Admin', 'Projektleiter', 'Gruppenleiter'] },
        { name: 'Warehouse', path: '/warehouse', icon: Box, roles: ['Admin', 'Projektleiter', 'Worker'] },
        { name: 'Requests', path: '/support', icon: ClipboardList, roles: ['Admin', 'Projektleiter', 'Büro'] },
        { name: 'Time Tracking', path: '/time-tracking', icon: FileText, roles: ['Admin', 'Projektleiter', 'Worker'] },
        { name: 'Content Management', path: '/content', icon: Settings, roles: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role || 'employee')
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:static lg:translate-x-0
            `}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Empire Premium</h1>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-6 px-3 space-y-1">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
                    <div className="mb-4">
                        <LanguageSwitcher className="w-full text-slate-300 hover:text-white" showLabel={true} />
                    </div>

                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="font-bold text-xs">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Abmelden
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="font-semibold text-slate-900">Empire Premium</span>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
