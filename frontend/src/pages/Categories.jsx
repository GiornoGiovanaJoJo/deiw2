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
import { Folder, Plus, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [parentCategory, setParentCategory] = useState('none');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await clientApi.getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const payload = {
                name: newCategoryName,
                type: 'Projekt',
                parent_id: parentCategory === 'none' ? null : parseInt(parentCategory)
            };
            await clientApi.createCategory(payload);
            setNewCategoryName('');
            setParentCategory('none');
            loadCategories();
        } catch (error) {
            console.error("Failed to create category", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await clientApi.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    // Filter only parent categories for the dropdown
    const parentCategories = categories.filter(c => !c.parent_id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Kategorien & Leistungen</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Neue Kategorie / Leistung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="Name der Kategorie"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Übergeordnete Kategorie (Optional)</label>
                                <Select value={parentCategory} onValueChange={setParentCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Keine (Hauptkategorie)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Keine (Hauptkategorie)</SelectItem>
                                        {parentCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Hinzufügen
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Liste</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>Eltern-Kategorie</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => {
                                    const parent = categories.find(p => p.id === cat.parent_id);
                                    return (
                                        <TableRow key={cat.id}>
                                            <TableCell>
                                                {cat.parent_id ? (
                                                    <div className="ml-4 w-2 h-2 rounded-full bg-slate-300"></div>
                                                ) : (
                                                    <Folder className="w-4 h-4 text-primary" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.type}</TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {parent ? parent.name : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Keine Kategorien gefunden
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
