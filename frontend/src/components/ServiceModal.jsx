import React, { useState, useMemo } from 'react';
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays } from 'date-fns';
import { publicApi } from "@/api/public";

const STEPS = {
    SERVICE: 0,
    DATE: 1,
    FORM: 2,
    SUCCESS: 3,
};

export default function ServiceModal({ isOpen, onClose, category }) {
    const { user } = useAuth();
    const [step, setStep] = useState(STEPS.SERVICE);

    // Recursive Navigation State
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [selectedSubService, setSelectedSubService] = useState(null); // The final leaf node

    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        city: ''
    });
    const [loading, setLoading] = useState(false);

    // Date Picker State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Reset state when modal opens/closes or category changes
    React.useEffect(() => {
        if (isOpen) {
            setStep(STEPS.SERVICE);
            // Initialize Breadcrumbs with the root category (if available)
            // If category is null (shouldn't happen if isOpen is true), handle gracefully
            if (category) {
                setBreadcrumbs([category]);
            }
            setSelectedSubService(null);
            setSelectedDate(null);
            setLoading(false);

            if (user) {
                setFormData({
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    email: user.email || '',
                    phone: user.phone || '',
                    message: '',
                    city: ''
                });
            } else {
                setFormData({ name: '', email: '', phone: '', message: '', city: '' });
            }
        }
    }, [isOpen, category, user]);

    // Current View Context
    const currentCategory = useMemo(() => {
        if (breadcrumbs.length === 0) return category;
        return breadcrumbs[breadcrumbs.length - 1];
    }, [breadcrumbs, category]);

    // Parse Modal Config (for current level or root)
    // We might want config to inherit or be specific to the current node
    const config = useMemo(() => {
        const target = currentCategory || category;
        if (!target?.modal_config) return null;
        try {
            return typeof target.modal_config === 'string'
                ? JSON.parse(target.modal_config)
                : target.modal_config;
        } catch (e) {
            console.error("Invalid modal config", e);
            return null;
        }
    }, [currentCategory, category]);

    // Determine Options for Current Level
    const currentOptions = useMemo(() => {
        if (!currentCategory) return [];

        // Priority 1: Config subServices (Virtual Children)
        // If the current category has 'subServices' defined in JSON, these take precedence as "Children"
        if (config?.subServices && Array.isArray(config.subServices) && config.subServices.length > 0) {
            return config.subServices.map(s => ({ ...s, isVirtual: true }));
        }

        // Priority 2: Database Children (Nested Categories)
        if (currentCategory.children && currentCategory.children.length > 0) {
            return currentCategory.children;
        }

        // Priority 3: Fallback (Only if Root and totally empty)
        if (breadcrumbs.length === 1 && (!currentCategory.children || currentCategory.children.length === 0)) {
            return [
                { id: '1', name: `Консультация: ${currentCategory.name}`, isVirtual: true },
                { id: '2', name: `Расчет стоимости`, isVirtual: true },
                { id: '3', name: `Выезд специалиста`, isVirtual: true },
            ];
        }

        return []; // Leaf Node logic handled in interaction
    }, [currentCategory, config, breadcrumbs.length]);


    const handleOptionClick = (option) => {
        // Check if Option is a Leaf
        // A helper logic: It's a leaf if it has NO children AND NO subServices config
        // OR if it is marked as 'isVirtual' (from JSON config) -> JSON subServices are always leaves in this simple version

        let isLeaf = false;

        if (option.isVirtual) {
            isLeaf = true;
        } else {
            // Check for DB children
            const hasChildren = option.children && option.children.length > 0;
            // Check for JSON config children (modal_config string or object)
            let hasConfigChildren = false;
            if (option.modal_config) {
                try {
                    const c = typeof option.modal_config === 'string' ? JSON.parse(option.modal_config) : option.modal_config;
                    if (c?.subServices && c.subServices.length > 0) hasConfigChildren = true;
                } catch (e) { }
            }

            if (!hasChildren && !hasConfigChildren) {
                isLeaf = true;
            }
        }

        if (isLeaf) {
            setSelectedSubService(option);
            setStep(STEPS.DATE);
        } else {
            // Dive deeper
            setBreadcrumbs([...breadcrumbs, option]);
        }
    };

    const handleBackStep = () => {
        if (step === STEPS.SERVICE) {
            if (breadcrumbs.length > 1) {
                setBreadcrumbs(prev => prev.slice(0, -1));
            } else {
                onClose();
            }
        } else if (step === STEPS.DATE) {
            setStep(STEPS.SERVICE);
        } else if (step === STEPS.FORM) {
            setStep(STEPS.DATE);
        }
    };

    const handleNext = () => {
        if (step === STEPS.DATE && selectedDate) {
            setStep(STEPS.FORM);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Format dynamic fields into message
            let fullMessage = formData.message || '';

            // Use config from the LEAF or the ROOT? 
            // Usually the form configuration comes from the CATEGORY that defined the service.
            // If we selected a 'Virtual' service from 'Renovation', 'Renovation' has the form config.
            // If we navigated 'Renovation' -> 'Painting' (DB Category) -> 'Wall Painting' (Virtual), 
            // 'Painting' might have its own form config?
            // Let's use `config` derived from `currentCategory` (which is the parent of the selected leaf if leaf is virtual, OR the leaf itself if it was a DB category being treated as service).

            // Correction: If `selectedSubService` is the service, we prefer ITS config if it exists (DB category), 
            // otherwise the parent's config.

            // Actually, `config` is computed from `currentCategory`. 
            // If we are at 'Painting' (currentCategory) and picked 'Wall Painting' (Virtual), `config` is 'Painting's config. Correct.

            if (config?.fields) {
                const dynamicDetails = config.fields
                    .filter(f => !['name', 'email', 'phone', 'message', 'city'].includes(f.name))
                    .map(f => `${f.label}: ${formData[f.name] || '-'}`)
                    .join('\n');

                if (dynamicDetails) {
                    fullMessage += `\n\n--- Детали заказа ---\n${dynamicDetails}`;
                }
            }

            if (formData.city) {
                fullMessage += `\nГород: ${formData.city}`;
            }

            // Build Category Path String
            const categoryPath = breadcrumbs.map(b => b.name).join(' > ');

            const ticketData = {
                subject: `Заявка: ${selectedSubService.name}`,
                message: fullMessage,
                sender_name: formData.name,
                sender_email: formData.email,
                sender_phone: formData.phone,
                category: categoryPath, // Send full path
                service_id: selectedSubService.id?.toString() || selectedSubService.name,
                booking_date: selectedDate ? selectedDate.toISOString() : null,
                source: "service_modal"
            };

            await publicApi.submitInquiry(ticketData);
            setStep(STEPS.SUCCESS);
        } catch (error) {
            console.error("Failed to submit ticket:", error);
            // Handle error (maybe show toast)
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helpers
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        // Add empty placeholders for start alignment
        const startDay = start.getDay(); // 0 is Sunday
        // Adjust for Monday start if needed (European) - let's assume Monday start
        const emptyDays = startDay === 0 ? 6 : startDay - 1;

        return { days, emptyDays };
    }, [currentMonth]);

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50 gap-0 h-[600px] flex">
                <DialogTitle className="sr-only">Бронирование услуги: {category.name}</DialogTitle>

                {/* Visual Side (Left) */}
                <div className="hidden md:flex w-1/3 bg-slate-900 text-white flex-col p-8 justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 z-0"></div>
                    <div className="relative z-10">
                        {/* Show Root Category Name always? Or Current? */}
                        {/* Showing Current is handy for navigation context */}
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                            {breadcrumbs.length > 1 && (
                                <>
                                    <span>{breadcrumbs[0].name}</span>
                                    {breadcrumbs.length > 2 && <ChevronRight className="w-3 h-3" />}
                                </>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{currentCategory?.name || category.name}</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">{currentCategory?.description || category.description}</p>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="space-y-4">
                            <div className={`flex items-center gap-3 transition-opacity ${step >= STEPS.SERVICE ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > STEPS.SERVICE ? 'bg-green-500 text-white' : step === STEPS.SERVICE ? 'bg-white text-slate-900' : 'bg-slate-700'}`}>
                                    {step > STEPS.SERVICE ? <Check className="w-4 h-4" /> : '1'}
                                </div>
                                <span>Услуга</span>
                            </div>
                            <div className={`flex items-center gap-3 transition-opacity ${step >= STEPS.DATE ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > STEPS.DATE ? 'bg-green-500 text-white' : step === STEPS.DATE ? 'bg-white text-slate-900' : 'bg-slate-700'}`}>
                                    {step > STEPS.DATE ? <Check className="w-4 h-4" /> : '2'}
                                </div>
                                <span>Дата</span>
                            </div>
                            <div className={`flex items-center gap-3 transition-opacity ${step >= STEPS.FORM ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > STEPS.FORM ? 'bg-green-500 text-white' : step === STEPS.FORM ? 'bg-white text-slate-900' : 'bg-slate-700'}`}>
                                    {step > STEPS.FORM ? <Check className="w-4 h-4" /> : '3'}
                                </div>
                                <span>Детали</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Side (Right) */}
                <div className="flex-1 flex flex-col w-full md:w-2/3 bg-white h-full overflow-y-auto relative">
                    <div className="p-8 flex-1">

                        {/* Step 0: Service Selection (Recursive) */}
                        {step === STEPS.SERVICE && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Breadcrumbs */}
                                <div className="flex items-center flex-wrap gap-2 mb-6 text-sm text-slate-500">
                                    {breadcrumbs.map((crumb, idx) => (
                                        <React.Fragment key={crumb.id || idx}>
                                            <button
                                                onClick={() => setBreadcrumbs(breadcrumbs.slice(0, idx + 1))}
                                                className={`hover:text-primary hover:underline transition-colors ${idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-900 pointer-events-none' : ''}`}
                                            >
                                                {crumb.name}
                                            </button>
                                            {idx < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4" />}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                                    {currentOptions.length > 0 ? "Выберите категорию или услугу" : "Услуга выбрана"}
                                </h3>

                                <div className="grid grid-cols-1 gap-3">
                                    {currentOptions.map((option, idx) => (
                                        <button
                                            key={option.id || idx}
                                            onClick={() => handleOptionClick(option)}
                                            className="p-4 rounded-xl border-2 text-left transition-all border-slate-100 bg-white hover:bg-slate-50 hover:border-primary/50 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Icon? If option has icon_name */}
                                                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">
                                                    {option.name}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}

                                    {currentOptions.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                                            <p className="text-slate-500">Нет доступных опций в этой категории.</p>
                                            <Button variant="link" onClick={() => setStep(STEPS.DATE)}>Пропустить выбор услуги</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Date Selection */}
                        {step === STEPS.DATE && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">В какие дни нужно выполнить работу?</h3>
                                <p className="text-slate-500 mb-6">Выберите желаемую дату начала</p>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors">
                                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                                        </button>
                                        <span className="font-semibold text-lg text-slate-900">
                                            {format(currentMonth, 'MMMM yyyy')}
                                        </span>
                                        <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors">
                                            <ChevronRight className="w-5 h-5 text-slate-600" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: calendarDays.emptyDays }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}
                                        {calendarDays.days.map((day) => {
                                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                                            const isTodayDate = isToday(day);
                                            return (
                                                <button
                                                    key={day.toString()}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`
                                                        aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                                                        ${isSelected
                                                            ? 'bg-primary text-white shadow-md'
                                                            : 'hover:bg-white hover:shadow-sm text-slate-700'}
                                                        ${isTodayDate && !isSelected ? 'text-primary font-bold' : ''}
                                                    `}
                                                >
                                                    {format(day, 'd')}
                                                    {isTodayDate && !isSelected && (
                                                        <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {selectedDate && (
                                    <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        Выбрано: <span className="font-medium">{format(selectedDate, 'dd.MM.yyyy')}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Form */}
                        {step === STEPS.FORM && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{config?.formTitle || "Заполните форму"}</h3>
                                <p className="text-slate-500 mb-6">{config?.formSubtitle || "Оставьте заявку, и мы ответим на все интересующие вопросы"}</p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Dynamic Fields from Config */}
                                    {config?.fields && config.fields.map((field, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <Label htmlFor={`field-${idx}`}>{field.label}</Label>
                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    id={`field-${idx}`}
                                                    placeholder={field.placeholder || ''}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    required={field.required}
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[80px]"
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    id={`field-${idx}`}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    required={field.required}
                                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="" disabled>{field.placeholder || "Выберите..."}</option>
                                                    {field.options?.map((opt, optIdx) => (
                                                        <option key={optIdx} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Input
                                                    id={`field-${idx}`}
                                                    type={field.type || 'text'}
                                                    placeholder={field.placeholder || ''}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    required={field.required}
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Default Fields (if no config or to append) */}
                                    {!config?.fields && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Полное имя</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Иван Иванов"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Номер телефона</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+7 (999) 000-00-00"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Адрес эл. почты</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="ivan@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Комментарий</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Опишите задачу подробнее..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[100px]"
                                                />
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {step === STEPS.SUCCESS && (
                            <div className="animate-in zoom-in duration-300 h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Заявка отправлена!</h3>
                                <p className="text-slate-600 max-w-md mx-auto mb-8">
                                    Мы получили вашу заявку на {selectedSubService?.name}.
                                    Наш менеджер свяжется с вами в течение 15 минут для уточнения деталей.
                                </p>
                                <Button onClick={onClose} size="lg" className="px-8">
                                    Вернуться на главную
                                </Button>
                            </div>
                        )}

                    </div>

                    {/* Navigation Buttons (Only for non-success steps) */}
                    {step !== STEPS.SUCCESS && (
                        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
                            <Button variant="outline" onClick={handleBackStep} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {step === STEPS.SERVICE && breadcrumbs.length <= 1 ? "Закрыть" : "Назад"}
                            </Button>

                            {step < STEPS.FORM ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={
                                        (step === STEPS.SERVICE) || // In Step 0, click on item triggers next. Next button disabled here unless logic changes.
                                        (step === STEPS.DATE && !selectedDate)
                                    }
                                    className={`gap-2 ${step === STEPS.SERVICE ? 'hidden' : ''}`} // Hide Next on Service selection, forcing item click?
                                >
                                    Далее <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || (config?.fields
                                        ? config.fields.some(f => f.required && !formData[f.name])
                                        : (!formData.name || !formData.phone))}
                                    className="gap-2 min-w-[140px]"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                    ) : (
                                        <>Отправить <Check className="w-4 h-4" /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
