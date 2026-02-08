import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ProjectCard({ project }) {
    return (
        <Link to={`/projects/${project.id}`} className="block h-full group">
            <article className="project-card h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100">
                {/* Image */}
                <div className="project-card__img relative overflow-hidden h-64 bg-slate-200">
                    {(project.photos && project.photos.length > 0) || project.foto ? (
                        <img
                            src={(project.photos && project.photos.length > 0) ? project.photos[0] : project.foto}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-100">
                            {project.name}
                        </div>
                    )}

                    {(!project.photos || project.photos.length === 0) && !project.foto && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-slate-500 text-sm font-medium px-4 text-center">{project.name}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            Подробнее <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="project-card__body flex-1 flex flex-col p-6">
                    <h3 className="project-card__title text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{project.name}</h3>

                    <p className="project-card__desc flex-1 line-clamp-3 text-slate-600 text-sm mb-4">
                        {project.description || "Keine Beschreibung verfügbar."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <span className="truncate max-w-[200px]">{project.adresse || "Adresse nicht angegeben"}</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
