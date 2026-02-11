import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import jsPDF from 'jspdf';
import { clientApi } from '@/api/client';
import { format } from 'date-fns';

export default function ProjectReports({ project }) {
    const [generating, setGenerating] = useState(false);

    const generatePDF = async () => {
        setGenerating(true);
        try {
            // Fetch additional data needed for report
            const [logsRes, timeRes] = await Promise.all([
                clientApi.getProductLogs(),
                clientApi.getTimeEntries()
            ]);

            const projectLogs = logsRes.data.filter(l => l.project_id === project.id);
            const projectTime = timeRes.data.filter(t => t.project_id === project.id);
            const totalHours = projectTime.reduce((acc, curr) => acc + (curr.hours || 0), 0);

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text(`Projektbericht: ${project.name}`, 14, 22);

            doc.setFontSize(10);
            doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 30);
            doc.text(`Projekt-Nr: ${project.projekt_nummer || '-'}`, 14, 35);
            doc.text(`Status: ${project.status}`, 14, 40);

            let y = 50;

            // Description
            doc.setFontSize(14);
            doc.text("Beschreibung", 14, y);
            y += 7;
            doc.setFontSize(10);
            const descLines = doc.splitTextToSize(project.description || "Keine Beschreibung", 180);
            doc.text(descLines, 14, y);
            y += (descLines.length * 5) + 10;

            // Details
            doc.setFontSize(14);
            doc.text("Details", 14, y);
            y += 7;
            doc.setFontSize(10);
            doc.text(`Adresse: ${project.address || '-'}`, 14, y);
            y += 5;
            doc.text(`Budget: ${project.budget ? project.budget.toFixed(2) + ' €' : '-'}`, 14, y);
            y += 5;
            doc.text(`Gesamtstunden: ${totalHours.toFixed(2)} h`, 14, y);
            y += 10;

            // Key Stats
            doc.setFontSize(14);
            doc.text("Statistiken", 14, y);
            y += 7;
            doc.setFontSize(10);
            doc.text(`Materialbewegungen: ${projectLogs.length}`, 14, y);
            y += 5;
            doc.text(`Zeiteinträge: ${projectTime.length}`, 14, y);
            y += 5;
            doc.text(`Fotos: ${project.photos ? project.photos.length : 0}`, 14, y);

            doc.save(`Bericht_${project.projekt_nummer || 'Projekt'}.pdf`);

        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Fehler beim Erstellen des Berichts.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    Projektberichte
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-6 text-center border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium mb-2">Gesamtbericht erstellen</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Generieren Sie eine detaillierte PDF-Zusammenfassung aller zum Projekt gehörenden Daten (Stunden, Materialien, Status).
                    </p>

                    <Button onClick={generatePDF} disabled={generating} size="lg">
                        {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Bericht herunterladen
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
