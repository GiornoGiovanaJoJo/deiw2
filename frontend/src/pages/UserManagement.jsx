import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await clientApi.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await clientApi.updateUserRole(userId, newRole);
            // Optimistic update or reload
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Не удалось обновить роль. Проверьте права доступа.");
        }
    };

    if (loading) {
        return <div className="p-8">Загрузка...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Управление пользователями</h1>
                <Button onClick={loadUsers}>Обновить список</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Пользователи ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Имя</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Статус</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(value) => handleRoleChange(user.id, value)}
                                            disabled={currentUser?.id === user.id} // Prevent changing own role easily to avoid lockout
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Выберите роль" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Projektleiter">Projektleiter</SelectItem>
                                                <SelectItem value="Gruppenleiter">Gruppenleiter</SelectItem>
                                                <SelectItem value="Worker">Worker</SelectItem>
                                                <SelectItem value="Büro">Büro</SelectItem>
                                                <SelectItem value="Warehouse">Warehouse</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
