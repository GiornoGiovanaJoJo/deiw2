import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Trash2, Building2, User } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: 'Firma',
        company_name: '',
        contact_person: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await clientApi.getCustomers();
            setCustomers(response.data);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await clientApi.createCustomer(formData);
            setFormData({ type: 'Firma', company_name: '', contact_person: '', email: '', phone: '' });
            loadCustomers();
        } catch (error) {
            console.error("Failed to create customer", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await clientApi.deleteCustomer(id);
            loadCustomers();
        } catch (error) {
            console.error("Failed to delete customer", error);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Kunden</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Neuer Kunde</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Typ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Firma">Firma</SelectItem>
                                    <SelectItem value="Privat">Privat</SelectItem>
                                </SelectContent>
                            </Select>

                            {formData.type === 'Firma' && (
                                <Input
                                    placeholder="Firmenname"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            )}

                            <Input
                                placeholder={formData.type === 'Firma' ? "Ansprechpartner" : "Vor- und Nachname"}
                                value={formData.contact_person}
                                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                            />

                            <Input
                                placeholder="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <Input
                                placeholder="Telefon"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />

                            <Button type="submit" className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Kunde anlegen
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Kundenliste</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>Name/Firma</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((cust) => (
                                    <TableRow key={cust.id}>
                                        <TableCell>
                                            {cust.type === 'Firma' ? <Building2 className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-green-500" />}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {cust.type === 'Firma' ? cust.company_name : cust.contact_person}
                                            {cust.type === 'Firma' && <div className="text-xs text-slate-500">{cust.contact_person}</div>}
                                        </TableCell>
                                        <TableCell>{cust.phone}</TableCell>
                                        <TableCell>{cust.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cust.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Keine Kunden gefunden
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
