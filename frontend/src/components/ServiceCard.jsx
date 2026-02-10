import React from 'react';
import { cn } from "@/lib/utils";

export default function ServiceCard({ category, onClick }) {
    // Parse description if it's a list (bullet points)
    const features = category.description
        ? category.description.split('\n').filter(line => line.trim().length > 0)
        : [];

    return (
        <article
            onClick={onClick}
            className="service-card h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 cursor-pointer group"
        >
            <div className="service-card__img min-h-[160px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden group">
                {/* Placeholder gradient/image logic - migrated from CSS if needed or kept simple */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <h3 className="text-white text-xl font-medium text-center px-4 relative z-10">
                    {category.name || category.title}
                </h3>
            </div>

            <div className="service-card__body flex-1 p-6 flex flex-col">
                <h4 className="service-card__title text-lg font-bold text-slate-900 mb-3">{category.name || category.title}</h4>

                {features.length > 0 ? (
                    <ul className="service-card__list space-y-2 mt-2">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <span className="mr-2 text-primary">•</span>
                                <span>{feature.replace(/^[•-]\s*/, '')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm">{category.description || "Keine Details verfügbar"}</p>
                )}
            </div>
        </article>
    );
}
