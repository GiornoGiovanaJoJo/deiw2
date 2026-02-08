import React, { useState, useEffect } from 'react';
import { clientApi } from "@/api/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, DollarSign } from "lucide-react";
import { format } from 'date-fns';

export default function CashRegister() {
    const [sales, setSales] = useState([]);
    const [registers, setRegisters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [newSale, setNewSale] = useState({
        amount: '',
        description: '',
        payment_method: 'Bar'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [salesRes, regRes] = await Promise.all([
                clientApi.getCashSales(),
                clientApi.getCashRegisters()
            ]);
            setSales(salesRes.data);
            setRegisters(regRes.data);
        } catch (error) {
            console.error("Failed to load cash register data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSale = async (e) => {
        e.preventDefault();
        try {
            await clientApi.createCashSale({
                ...newSale,
                amount: parseFloat(newSale.amount)
            });
            setIsSaleModalOpen(false);
            setNewSale({ amount: '', description: '', payment_method: 'Bar' });
            loadData();
        } catch (error) {
            console.error("Failed to create sale", error);
            alert("Fehler beim Erstellen des Verkaufs.");
        }
    };

    const totalBalance = registers.reduce((acc, reg) => acc + (reg.balance || 0), 0);

    if (loading) return <div>Laden...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kassenstand Gesamt</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€ {totalBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
                {/* Add more stats if needed */}
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Verkäufe / Transaktionen</h2>
                <Button onClick={() => setIsSaleModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Neuer Verkauf
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Beschreibung</TableHead>
                                <TableHead>Methode</TableHead>
                                <TableHead className="text-right">Betrag</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{format(new Date(sale.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                                    <TableCell>{sale.description}</TableCell>
                                    <TableCell>{sale.payment_method}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        € {sale.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neuer Barkauf / Einlage</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSale} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Betrag (€)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                required
                                value={newSale.amount}
                                onChange={e => setNewSale({ ...newSale, amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Input
                                required
                                value={newSale.description}
                                onChange={e => setNewSale({ ...newSale, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Zahlungsmethode</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                value={newSale.payment_method}
                                onChange={e => setNewSale({ ...newSale, payment_method: e.target.value })}
                            >
                                <option value="Bar">Bar</option>
                                <option value="Karte">Karte</option>
                            </select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Speichern</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
