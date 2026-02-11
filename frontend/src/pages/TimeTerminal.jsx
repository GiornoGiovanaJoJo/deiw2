import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, LogIn, LogOut, Play, Square, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TimeTerminal() {
    const [step, setStep] = useState('login'); // login, action
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loginInput, setLoginInput] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Tracking state
    const [activeProject, setActiveProject] = useState('');
    const [activeEntry, setActiveEntry] = useState(null); // If user has a running entry

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [uRes, pRes] = await Promise.all([
                clientApi.getAllUsers(),
                clientApi.getMyProjects() // In terminal mode, maybe all projects? let's use all if possible or my
            ]);
            setUsers(uRes.data);
            setProjects(pRes.data);
        } catch (error) {
            console.error("Failed to load terminal data", error);
        }
    };

    const handleLogin = async () => {
        // Simple mock login with ID or PIN match
        // In real world: check against user.id or user.pin
        const user = users.find(u => u.id.toString() === loginInput || u.email === loginInput);
        if (user) {
            setCurrentUser(user);
            setStep('action');
            setLoginInput('');
            checkActiveEntry(user.id);
        } else {
            alert("Benutzer nicht gefunden");
        }
    };

    const checkActiveEntry = async (userId) => {
        // Check if user has an unfinished time entry
        try {
            const res = await clientApi.getTimeEntries();
            const userEntries = res.data.filter(e => e.user_id === userId && !e.end_time);
            if (userEntries.length > 0) {
                setActiveEntry(userEntries[0]);
                setActiveProject(userEntries[0].project_id ? userEntries[0].project_id.toString() : '');
            } else {
                setActiveEntry(null);
                setActiveProject('');
            }
        } catch (error) {
            console.error("Failed to check active entries", error);
        }
    };

    const handleClockIn = async () => {
        if (!currentUser) return;
        try {
            const now = new Date();
            const timeStr = now.toTimeString().substring(0, 5); // HH:MM
            const dateStr = now.toISOString().split('T')[0];

            await clientApi.createTimeEntry({
                user_id: currentUser.id,
                date: dateStr,
                start_time: timeStr,
                project_id: activeProject ? parseInt(activeProject) : null,
                description: 'Terminal Buchung'
            });

            setSuccessMsg(`Angemeldet um ${timeStr}`);
            await checkActiveEntry(currentUser.id);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Clock in failed", error);
            alert("Fehler beim Anmelden");
        }
    };

    const handleClockOut = async () => {
        if (!activeEntry) return;
        try {
            const now = new Date();
            const timeStr = now.toTimeString().substring(0, 5); // HH:MM

            await clientApi.updateTimeEntry(activeEntry.id, {
                end_time: timeStr
            });

            setSuccessMsg(`Abgemeldet um ${timeStr}`);
            setActiveEntry(null);
            setActiveProject('');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Clock out failed", error);
            alert("Fehler beim Abmelden");
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setStep('login');
        setSuccessMsg('');
    };

    if (step === 'login') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Zeiterfassungsterminal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Benutzer ID / PIN</Label>
                            <Input
                                type="password"
                                value={loginInput}
                                onChange={e => setLoginInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                className="text-center text-lg h-12"
                                placeholder="Eingeben..."
                                autoFocus
                            />
                        </div>
                        <Button className="w-full h-12 text-lg" onClick={handleLogin}>
                            Anmelden
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                            {currentUser.first_name[0]}{currentUser.last_name[0]}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{currentUser.first_name} {currentUser.last_name}</p>
                            <p className="text-slate-500 text-sm">Mitarbeiter</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>Abmelden</Button>
                </div>

                {successMsg && (
                    <div className="bg-emerald-500 text-white p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold">{successMsg}</span>
                    </div>
                )}

                {/* Status Card */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className={`h-2 ${activeEntry ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <CardContent className="p-8 text-center space-y-6">
                        {activeEntry ? (
                            <>
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-2">
                                    <Clock className="w-12 h-12 text-emerald-600 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-emerald-700">Angemeldet</h2>
                                    <p className="text-slate-500 mt-1">
                                        seit {activeEntry.start_time} Uhr
                                        {activeEntry.project_id && ` auf Projekt #${activeEntry.project_id}`}
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    className="w-full h-16 text-xl gap-2"
                                    onClick={handleClockOut}
                                >
                                    <Square className="w-6 h-6 fill-current" />
                                    BEENDEN / GEHT
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-2">
                                    <LogOut className="w-12 h-12 text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-700">Nicht angemeldet</h2>
                                    <p className="text-slate-500 mt-1">Bitte Projekt wählen und anmelden</p>
                                </div>

                                <div className="max-w-xs mx-auto text-left space-y-2">
                                    <Label>Projekt (Optional)</Label>
                                    <Select value={activeProject} onValueChange={setActiveProject}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Kein Projekt / Allgemein" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Kein Projekt / Allgemein</SelectItem>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.projekt_nummer} {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-16 text-xl gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleClockIn}
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    STARTEN / KOMMT
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
