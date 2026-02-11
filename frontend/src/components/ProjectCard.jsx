import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ProjectCard({ project }) {
    return (
        <Link to={`/projects/${project.id}`} className="block h-full group">
            <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative overflow-hidden h-64 md:h-72 bg-slate-100">
                    {(project.photos && project.photos.length > 0) || project.foto ? (
                        <img
                            src={(project.photos && project.photos.length > 0) ? project.photos[0] : project.foto}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <span className="text-slate-400 font-medium">Нет изображения</span>
                        </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                    {/* Content over image */}
                    <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="inline-block px-3 py-1 mb-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/20">
                            {project.status || "Завершен"}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 shadow-sm leading-tight">
                            {project.name}
                        </h3>
                        <p className="text-slate-200 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <ArrowRight className="w-4 h-4" /> Подробнее о проекте
                        </p>
                    </div>
                </div>

                {/* Additional Info (optional, usually image is enough for premium feel, but let's keep minimal info) */}
                <div className="p-5 flex-1 flex flex-col">
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                        {project.description || "Описание проекта скоро появится."}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                        <span>{project.adresse || "Москва"}</span>
                        {project.end_date && <span>{new Date(project.end_date).getFullYear()}</span>}
                    </div>
                </div>
            </article>
        </Link>
    );
}
