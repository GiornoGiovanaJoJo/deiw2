import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FolderKanban,
    ClipboardList,
    TrendingUp,
    Clock,
    CheckCircle2,
    Users
} from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-emerald-600">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        projects: { total: 0, in_progress: 0, completed: 0 },
        tasks: { total: 0, open: 0, in_progress: 0 },
        users: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await clientApi.getDashboardStats();

                setStats({
                    projects: data.projects,
                    tasks: data.tasks,
                    users: data.users
                });
                setRecentProjects(data.recentProjects);
            } catch (error) {
                console.error("Fehler beim Laden:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Übersicht über Ihr Unternehmen</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Projekte gesamt"
                    value={stats.projects.total}
                    icon={FolderKanban}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="In Bearbeitung"
                    value={stats.projects.in_progress}
                    icon={Clock}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    title="Offene Aufgaben"
                    value={stats.tasks.open}
                    icon={ClipboardList}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Benutzer"
                    value={stats.users}
                    icon={Users}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* Recent Projects */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Aktuelle Projekte</CardTitle>
                    <Link
                        to="/projects" // Will implement this page later
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        Alle →
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentProjects.length > 0 ? (
                        <div className="space-y-3">
                            {recentProjects.map((projekt) => (
                                <div
                                    key={projekt.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FolderKanban className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 truncate">{projekt.name}</p>
                                            <p className="text-sm text-slate-500">{projekt.projekt_nummer || "Keine Nummer"}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${projekt.status === "In Bearbeitung" ? "bg-blue-100 text-blue-700" :
                                        projekt.status === "Abgeschlossen" ? "bg-emerald-100 text-emerald-700" :
                                            "bg-slate-100 text-slate-700"
                                        }`}>
                                        {projekt.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            Keine Projekte vorhanden
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
