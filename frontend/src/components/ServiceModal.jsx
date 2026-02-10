import React, { useState, useMemo } from 'react';
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
    const [step, setStep] = useState(STEPS.SERVICE);
    const [selectedSubService, setSelectedSubService] = useState(null);
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
            setSelectedSubService(null);
            setSelectedDate(null);
            setLoading(false);
            setFormData({ name: '', email: '', phone: '', message: '', city: '' });
        }
    }, [isOpen, category]);

    // Mock sub-services if category doesn't have children (for demo/fallback)
    const subServices = useMemo(() => {
        if (!category) return [];
        if (category.children && category.children.length > 0) return category.children;
        // Fallback for demo if no children structure yet
        return [
            { id: '1', name: `Консультация: ${category.name}` },
            { id: '2', name: `Расчет стоимости: ${category.name}` },
            { id: '3', name: `Выезд специалиста` },
        ];
    }, [category]);

    const handleNext = () => {
        if (step === STEPS.SERVICE && selectedSubService) {
            setStep(STEPS.DATE);
        } else if (step === STEPS.DATE && selectedDate) {
            setStep(STEPS.FORM);
        }
    };

    const handleBack = () => {
        if (step === STEPS.DATE) setStep(STEPS.SERVICE);
        if (step === STEPS.FORM) setStep(STEPS.DATE);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const ticketData = {
                subject: `Заявка на услугу: ${category.name} - ${selectedSubService.name}`,
                message: formData.message,
                sender_name: formData.name,
                sender_email: formData.email,
                sender_phone: formData.phone,
                category: category.name,
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

                {/* Visual Side (Left) - Hidden on mobile if needed, but keeping for design */}
                <div className="hidden md:flex w-1/3 bg-slate-900 text-white flex-col p-8 justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">{category.name}</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">{category.description}</p>
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

                        {/* Step 0: Service Selection */}
                        {step === STEPS.SERVICE && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Выберите конкретную услугу</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {subServices.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setSelectedSubService(sub)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 flex items-center justify-between group
                                                ${selectedSubService?.id === sub.id
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                                        >
                                            <span className={`font-medium ${selectedSubService?.id === sub.id ? 'text-primary' : 'text-slate-700'}`}>
                                                {sub.name}
                                            </span>
                                            {selectedSubService?.id === sub.id && (
                                                <Check className="w-5 h-5 text-primary" />
                                            )}
                                        </button>
                                    ))}
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
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Заполните форму</h3>
                                <p className="text-slate-500 mb-6">Оставьте заявку, и мы ответим на все интересующие вопросы</p>

                                <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Город</Label>
                                            <Input
                                                id="city"
                                                placeholder="Москва"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            />
                                        </div>
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
                            {step > STEPS.SERVICE ? (
                                <Button variant="outline" onClick={handleBack} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Назад
                                </Button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {step < STEPS.FORM ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={
                                        (step === STEPS.SERVICE && !selectedSubService) ||
                                        (step === STEPS.DATE && !selectedDate)
                                    }
                                    className="gap-2"
                                >
                                    Далее <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.name || !formData.phone}
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
