import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import ProjectStages from './ProjectStages'; // Reuse for display, or simple list

export default function ProjectAcceptance({ projectId }) {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch stages to toggle their visibility
            const res = await clientApi.getProjectStages(projectId);
            // Assuming stages have a 'client_visible' or similar field.
            // If not in backend yet, we might need to mock or just assume it's there for now.
            // Let's assume we can update it.
            setStages(res.data);
        } catch (error) {
            console.error("Failed to load stages", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStageVisibility = async (stageId, currentVal) => {
        try {
            const newVal = !currentVal;
            // Optimistic update
            setStages(prev => prev.map(s => s.id === stageId ? { ...s, client_visible: newVal } : s));

            await clientApi.updateProjectStage(stageId, { client_visible: newVal });
        } catch (error) {
            console.error("Failed to update stage visibility", error);
            loadData(); // Revert on error
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Laden...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-slate-500" />
                        Kundenabnahme & Freigabe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 mb-6">
                        Steuern Sie hier, welche Inhalte für den Kunden im Kundenportal sichtbar sind.
                    </p>

                    <div className="space-y-4">
                        <h3 className="font-medium text-slate-900">Bauphasen & Dokumentation</h3>
                        {stages.length === 0 ? (
                            <p className="text-slate-400 italic">Keine Phasen vorhanden.</p>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {stages.map((stage) => (
                                    <div key={stage.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${stage.status === 'Abgeschlossen' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            <div>
                                                <p className="font-medium">{stage.name}</p>
                                                <p className="text-xs text-slate-500">{stage.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Label htmlFor={`visible-${stage.id}`} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                {stage.client_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                {stage.client_visible ? 'Sichtbar' : 'Verborgen'}
                                            </Label>
                                            <Switch
                                                id={`visible-${stage.id}`}
                                                checked={!!stage.client_visible}
                                                onCheckedChange={() => toggleStageVisibility(stage.id, stage.client_visible)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Future: Add Document visibility toggle similar to stages */}
                </CardContent>
            </Card>
        </div>
    );
}
