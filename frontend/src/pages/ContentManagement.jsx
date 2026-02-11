import React, { useState, useEffect } from 'react';
import { clientApi } from '@/api/client';
import { publicApi } from '@/api/public';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Upload, Save } from "lucide-react";

export default function ContentManagement() {
    const [heroContent, setHeroContent] = useState({
        title: '',
        subtitle: '',
        logo: '',
        images: []
    });
    const [servicesContent, setServicesContent] = useState({
        title: 'Наши услуги'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        try {
            const [heroData, servicesData] = await Promise.all([
                publicApi.getContent('home_hero'),
                publicApi.getContent('home_services')
            ]);

            if (heroData) setHeroContent(heroData.content);
            if (servicesData) setServicesContent(servicesData.content);

        } catch (error) {
            console.error("Failed to load content", error);
        } finally {
            setLoading(false);
        }
    };

    const handleHeroSave = async () => {
        try {
            await clientApi.updateContent('home_hero', { content: heroContent });
            alert("Hero content updated successfully!");
        } catch (error) {
            console.error("Failed to update hero content", error);
            alert("Failed to update content.");
        }
    };

    const handleServicesSave = async () => {
        try {
            await clientApi.updateContent('home_services', { content: servicesContent });
            alert("Services content updated successfully!");
        } catch (error) {
            console.error("Failed to update services content", error);
            alert("Failed to update content.");
        }
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await clientApi.uploadFile(formData);
            const url = res.data.url; // Assuming returns { url: ... }

            if (type === 'logo') {
                setHeroContent(prev => ({ ...prev, logo: url }));
            } else if (type === 'hero_image') {
                setHeroContent(prev => ({ ...prev, images: [...(prev.images || []), url] }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        }
    };

    const removeHeroImage = (index) => {
        setHeroContent(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Content Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Home Page - Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="font-medium">Logo URL (replaces text)</label>
                        <div className="flex gap-2">
                            <Input
                                value={heroContent.logo || ''}
                                onChange={e => setHeroContent({ ...heroContent, logo: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Button variant="outline"><Upload className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        {heroContent.logo && <img src={heroContent.logo} alt="Logo Preview" className="h-10 object-contain bg-slate-100 p-1" />}
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Title</label>
                        <Input
                            value={heroContent.title || ''}
                            onChange={e => setHeroContent({ ...heroContent, title: e.target.value })}
                            placeholder="строим ваше будущее!"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Subtitle</label>
                        <Textarea
                            rows={3}
                            value={heroContent.subtitle || ''}
                            onChange={e => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                            placeholder="Empire Premium — это..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Hero Images (Carousel)</label>
                        <div className="flex flex-wrap gap-4">
                            {(heroContent.images || []).map((img, idx) => (
                                <div key={idx} className="relative group w-32 h-20">
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        onClick={() => removeHeroImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="w-32 h-20 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center relative hover:bg-slate-50">
                                <Plus className="w-6 h-6 text-slate-400" />
                                <input
                                    type="file"
                                    onChange={(e) => handleImageUpload(e, 'hero_image')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleHeroSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Home Page - Services Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="font-medium">Section Title</label>
                        <Input
                            value={servicesContent.title || ''}
                            onChange={e => setServicesContent({ ...servicesContent, title: e.target.value })}
                            placeholder="Наши услуги"
                        />
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleServicesSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>

                    <div className="pt-4 border-t mt-4">
                        <p className="text-sm text-slate-500">
                            To add or edit individual services/categories, please use the
                            <a href="/categories" className="text-blue-600 hover:underline mx-1">Categories</a>
                            section.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
