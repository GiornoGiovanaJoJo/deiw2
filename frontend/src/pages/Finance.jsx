import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, DollarSign, Wallet, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

export default function Finance() {
    const [registers, setRegisters] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        amount: "",
        payment_method: "Bar",
        description: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [regData, salesData] = await Promise.all([
                clientApi.getCashRegisters(),
                clientApi.getCashSales()
            ]);
            setRegisters(regData.data);
            setSales(salesData.data);
        } catch (error) {
            console.error("Error loading finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await clientApi.createCashSale({
                amount: parseFloat(form.amount),
                payment_method: form.payment_method, // "Bar" or "Karte"
                description: form.description,
                status: "Abgeschlossen" // Auto-complete for now
            });
            setDialogOpen(false);
            loadData();
        } catch (error) {
            console.error("Error saving sale:", error);
        }
    };

    const openNewDialog = () => {
        setForm({
            amount: "",
            payment_method: "Bar",
            description: ""
        });
        setDialogOpen(true);
    };

    const totalBalance = registers.reduce((acc, r) => acc + (r.balance || 0), 0);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Finanzen</h1>
                    <p className="text-slate-500 mt-1">Kassen und Verkäufe verwalten</p>
                </div>
                <Button onClick={openNewDialog} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Verkauf
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cash Registers */}
                {registers.map(reg => (
                    <Card key={reg.id} className="border-0 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${reg.status === 'Verbunden' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{reg.name}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{reg.balance?.toFixed(2)} €</h3>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Wallet className="w-6 h-6 text-slate-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                {reg.status === 'Verbunden' ? (
                                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Verbunden</span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Getrennt</span>
                                )}
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500">Letztes Update: {reg.last_sync ? new Date(reg.last_sync).toLocaleTimeString() : '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Card className="border-0 shadow-sm bg-blue-600 text-white">
                    <CardContent className="p-6">
                        <p className="text-blue-100 mb-1">Gesamtbestand</p>
                        <h3 className="text-3xl font-bold">{totalBalance.toFixed(2)} €</h3>
                        <p className="text-blue-200 text-sm mt-4">Über alle Kassen</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales List */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Letzte Verkäufe</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Beschreibung</TableHead>
                                <TableHead>Methode</TableHead>
                                <TableHead>Betrag</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Laden...</TableCell>
                                </TableRow>
                            ) : sales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">Keine Verkäufe</TableCell>
                                </TableRow>
                            ) : (
                                sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            {sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{sale.description || "Verkauf"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{sale.payment_method}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-emerald-600">+{sale.amount?.toFixed(2)} €</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{sale.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neuer Verkauf</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Betrag (€)</Label>
                            <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Zahlungsmethode</Label>
                            <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bar">Bar</SelectItem>
                                    <SelectItem value="Karte">Karte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleSave}>Speichern</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
