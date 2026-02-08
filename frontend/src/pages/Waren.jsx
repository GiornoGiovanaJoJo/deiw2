import React, { useState, useEffect } from "react";
import { clientApi } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"; // Ensure this exists or use fallback
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
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Barcode, X, TrendingUp } from "lucide-react";
// import { toast } from "sonner"; // Assuming sonner is not installed, use simple alert or console for now, or install it.

const EINHEITEN = ["Stk", "kg", "m", "l", "m²", "m³", "Set"];

export default function Waren() {
    const [waren, setWaren] = useState([]);
    const [kategorien, setKategorien] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterKategorie, setFilterKategorie] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWare, setEditingWare] = useState(null);
    const [lieferungDialog, setLieferungDialog] = useState(false);
    const [lieferungMenge, setLieferungMenge] = useState("");
    const [inventurDialog, setInventurDialog] = useState(false);
    const [inventurMenge, setInventurMenge] = useState("");

    // Form state
    const [form, setForm] = useState({
        name: "",
        beschreibung: "",
        barcode: "",
        kategorie_id: "",
        einheit: "Stk",
        einkaufspreis: "",
        verkaufspreis: "",
        bestand: "",
        mindestbestand: "",
        lagerort: "",
        notizen: "",
        bild: "",
        status: "Verfügbar"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [warenData, kategorienData] = await Promise.all([
                clientApi.getProducts(),
                clientApi.getCategories()
            ]);
            setWaren(warenData.data);
            setKategorien(kategorienData.data);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateBarcode = () => {
        const prefix = "400";
        const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, "0");
        const checksum = calculateEANChecksum(prefix + random.slice(0, 9));
        return prefix + random.slice(0, 9) + checksum;
    };

    const calculateEANChecksum = (code) => {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }
        return ((10 - (sum % 10)) % 10).toString();
    };

    const resetForm = () => {
        setEditingWare(null);
        setForm({
            name: "",
            beschreibung: "",
            barcode: "",
            kategorie_id: "",
            einheit: "Stk",
            einkaufspreis: "",
            verkaufspreis: "",
            bestand: "",
            mindestbestand: "",
            lagerort: "",
            notizen: "",
            bild: "",
            status: "Verfügbar"
        });
    };

    const openNewDialog = () => {
        resetForm();
        setForm(prev => ({ ...prev, barcode: generateBarcode() }));
        setDialogOpen(true);
    };

    const handleEdit = (item) => {
        setEditingWare(item);
        setForm({
            name: item.name || "",
            beschreibung: item.description || "", // Field name diff: description vs beschreibung
            barcode: item.barcode || "",
            kategorie_id: item.category_id?.toString() || "", // Field name diff: category_id vs kategorie_id
            einheit: item.unit || "Stk", // Field name diff: unit vs einheit
            einkaufspreis: item.purchase_price?.toString() || "", // purchase_price vs einkaufspreis
            verkaufspreis: item.sales_price?.toString() || "", // sales_price vs verkaufspreis
            bestand: item.stock?.toString() || "", // stock vs bestand
            mindestbestand: item.min_stock?.toString() || "", // min_stock vs mindestbestand
            lagerort: item.location || "", // location vs lagerort
            notizen: item.notes || "", // notes vs notizen
            bild: item.image_url || "", // image_url vs bild
            status: item.status || "Verfügbar"
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            // Map form back to backend model schema
            const data = {
                name: form.name,
                description: form.beschreibung,
                barcode: form.barcode,
                category_id: form.kategorie_id ? parseInt(form.kategorie_id) : null,
                unit: form.einheit,
                purchase_price: form.einkaufspreis ? parseFloat(form.einkaufspreis) : null,
                sales_price: form.verkaufspreis ? parseFloat(form.verkaufspreis) : null,
                stock: form.bestand ? parseFloat(form.bestand) : 0,
                min_stock: form.mindestbestand ? parseFloat(form.mindestbestand) : 0,
                location: form.lagerort,
                notes: form.notizen,
                image_url: form.bild,
                status: form.status
            };

            // Recalculate status based on stock
            if (data.stock <= 0) data.status = "Ausverkauft";
            else if (data.stock <= data.min_stock) data.status = "Niedrig";
            else data.status = "Verfügbar";

            if (editingWare) {
                await clientApi.updateProduct(editingWare.id, data);
            } else {
                await clientApi.createProduct(data);
            }
            setDialogOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Wirklich löschen?")) {
            try {
                await clientApi.deleteProduct(id);
                loadData();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    // UI Helper
    const getKategorieName = (id) => {
        const kat = kategorien.find(k => k.id === id);
        return kat?.name || "-";
    };

    const statusColors = {
        "Verfügbar": "bg-emerald-100 text-emerald-700",
        "Niedrig": "bg-amber-100 text-amber-700",
        "Ausverkauft": "bg-red-100 text-red-700"
    };

    const filteredWaren = waren.filter(w => {
        const matchesSearch =
            w.name?.toLowerCase().includes(search.toLowerCase()) ||
            w.barcode?.includes(search);
        const matchesKategorie = filterKategorie === "all" || w.category_id?.toString() === filterKategorie;
        return matchesSearch && matchesKategorie;
    });

    const lowStockCount = waren.filter(w => w.status === "Niedrig" || w.status === "Ausverkauft").length;

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Waren</h1>
                    <p className="text-slate-500 mt-1">Artikelstamm und Lagerbestände verwalten</p>
                </div>
                <div className="flex items-center gap-3">
                    {lowStockCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {lowStockCount} niedrig
                        </Badge>
                    )}
                    <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Artikel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Name oder Barcode suchen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterKategorie} onValueChange={setFilterKategorie}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Kategorie filtern" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle Kategorien</SelectItem>
                                {kategorien.map(k => (
                                    <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Artikel</TableHead>
                                <TableHead className="hidden md:table-cell">Barcode</TableHead>
                                <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                                <TableHead>Bestand</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Laden...</TableCell>
                                </TableRow>
                            ) : filteredWaren.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">Keine Artikel gefunden</TableCell>
                                </TableRow>
                            ) : (
                                filteredWaren.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.name}</p>
                                                    {item.location && <p className="text-xs text-slate-400">{item.location}</p>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{item.barcode || "-"}</code>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {getKategorieName(item.category_id)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{item.stock} {item.unit}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[item.status] || "bg-slate-100 text-slate-700"}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Editor Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>{editingWare ? "Artikel bearbeiten" : "Neuer Artikel"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Beschreibung</Label>
                            <Textarea value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Barcode</Label>
                                <div className="flex gap-2">
                                    <Input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
                                    <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, barcode: generateBarcode() })}>
                                        <Barcode className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Kategorie</Label>
                                <Select value={form.kategorie_id} onValueChange={(v) => setForm({ ...form, kategorie_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Keine</SelectItem>
                                        {kategorien.map(k => (
                                            <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bestand</Label>
                                <Input type="number" value={form.bestand} onChange={e => setForm({ ...form, bestand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Min. Bestand</Label>
                                <Input type="number" value={form.mindestbestand} onChange={e => setForm({ ...form, mindestbestand: e.target.value })} />
                            </div>
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
