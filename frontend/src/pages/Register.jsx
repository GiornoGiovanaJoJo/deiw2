import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await authApi.register({
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            });

            // On success, redirect to login
            navigate('/login', { state: { message: 'Регистрация успешна! Теперь вы можете войти.' } });
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ошибка регистрации. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-slate-900 bg-slate-50">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placehold.co/1200x1200/0f172a/ffffff?text=Join+Us')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 p-12 text-white max-w-lg text-center">
                    <h1 className="text-4xl font-bold mb-6">Присоединяйтесь к Empire Premium</h1>
                    <p className="text-xl text-slate-300">
                        Создайте аккаунт, чтобы получить доступ к эксклюзивным функциям и управлению.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-8 py-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Регистрация</h2>
                        <p className="mt-2 text-slate-500">Заполните форму ниже для создания аккаунта</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Имя</Label>
                                <Input id="firstName" placeholder="Иван" autoComplete="given-name" className="h-11 bg-slate-50 border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]" onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Фамилия</Label>
                                <Input id="lastName" placeholder="Иванов" autoComplete="family-name" className="h-11 bg-slate-50 border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="email" type="email" placeholder="ivan@example.com" autoComplete="email" className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Повторите пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]" onChange={handleChange} required />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base bg-[#7C3AED] hover:bg-[#6D28D9]" disabled={loading}>
                            {loading ? "Регистрация..." : "Создать аккаунт"} <UserPlus className="ml-2 w-4 h-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Уже есть аккаунт?{" "}
                        <Link to="/login" className="font-semibold text-[#7C3AED] hover:underline">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
