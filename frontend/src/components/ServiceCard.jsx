import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function ServiceCard({ category, onClick, icon: Icon }) {
    // Parse description if it's a list (bullet points)
    const features = category.description
        ? category.description.split('\n').filter(line => line.trim().length > 0)
        : [];

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100 hover:-translate-y-1 overflow-hidden h-full flex flex-col"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                {Icon ? <Icon className="w-7 h-7" /> : <Check className="w-7 h-7" />}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                {category.name || category.title}
            </h3>

            {features.length > 0 ? (
                <ul className="space-y-2 mb-6 flex-grow">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-600">
                            <span className="mr-2 text-indigo-500 mt-0.5">•</span>
                            <span>{feature.replace(/^[•-]\s*/, '')}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed">
                    {category.description || "Профессиональное выполнение работ любой сложности с гарантией качества."}
                </p>
            )}

            <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                Подробнее <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </div>
    );
}
