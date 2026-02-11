import React from 'react';

export default function ServiceCard({ category, onClick }) {
    // Parse description if it's a list (bullet points)
    const features = category.description
        ? category.description.split('\n').filter(line => line.trim().length > 0)
        : [];

    return (
        <article className="service-card h-full flex flex-col cursor-pointer group" onClick={onClick}>
            <div className="service-card__img min-h-[160px] relative overflow-hidden">
                {category.image_url ? (
                    <img
                        src={category.image_url}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

                <div className="relative z-10 p-4 h-full flex flex-col items-center justify-center">
                    {category.label && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            {category.label}
                        </span>
                    )}
                    <h3 className="text-white text-xl font-medium text-center">
                        {category.name || category.title}
                    </h3>
                </div>
            </div>

            <div className="service-card__body flex-1 bg-white p-6 border border-t-0 border-slate-100 rounded-b-xl">
                <h4 className="service-card__title font-bold text-lg mb-3 text-slate-900">{category.name || category.title}</h4>

                {features.length > 0 ? (
                    <ul className="service-card__list space-y-2">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <span className="mr-2 text-primary">•</span>
                                <span>{feature.replace(/^[•-]\s*/, '')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm italic">Keine Details verfügbar</p>
                )}
            </div>
        </article>
    );
}
