import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from "date-fns";
import { Loader2, ArrowLeft, MapPin, Phone, Recycle, Paperclip, GlassWater, Leaf, Cpu, Hammer } from 'lucide-react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

// --- Enhanced Zod Schema including wasteTypes ---
const bookingFlowSchema = z.object({
  wasteTypes: z.array(z.string()).min(1, { message: "Please select at least one waste type." }),
  pickupDate: z.date({ required_error: "Please select a pickup date." }),
  pickupTime: z.string({ required_error: "Please select a pickup time." }),
  pickupLocation: z.string().min(10, { message: "Please enter a full pickup address." }),
  contactPhone: z.string().min(10, { message: "A valid phone number is required." }),
});

// --- Data and Components for Waste Type Selection ---
const wasteTypeOptions = [
    { id: 'PLASTIC', label: 'Plastic', icon: Recycle },
    { id: 'PAPER', label: 'Paper', icon: Paperclip },
    { id: 'GLASS', label: 'Glass', icon: GlassWater },
    { id: 'ORGANIC', label: 'Organic', icon: Leaf },
    { id: 'ELECTRONIC', label: 'Electronic', icon: Cpu },
    { id: 'METAL', label: 'Metal', icon: Hammer },
];

const WasteTypeSelector = ({ field }) => {
    const toggleWasteType = (type) => {
        const currentTypes = field.value || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];
        field.onChange(newTypes);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {wasteTypeOptions.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => toggleWasteType(id)}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 h-24",
                        (field.value || []).includes(id)
                            ? "bg-emerald-100 border-primary text-primary shadow-lg scale-105"
                            : "bg-white/70 border-emerald-300/30 hover:bg-emerald-50 hover:border-emerald-300"
                    )}
                >
                    <Icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-semibold">{label}</span>
                </button>
            ))}
        </div>
    );
};


// --- Helper functions (getDisabledDays, generateTimeSlots) are unchanged ---
const getDisabledDays = (operatingHoursJSON) => {
    let operatingHours = {};
    try { operatingHours = JSON.parse(operatingHoursJSON || '{}'); } catch (e) { return []; }
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const availableDays = Object.keys(operatingHours).map(day => dayMap[day]);
    return [{ dayOfWeek: [0, 1, 2, 3, 4, 5, 6].filter(day => !availableDays.includes(day)) }, { before: new Date(new Date().setHours(0, 0, 0, 0)) }];
};
const generateTimeSlots = (operatingHoursJSON, selectedDate) => {
    if (!operatingHoursJSON || !selectedDate) return [];
    let operatingHours = {};
    try { operatingHours = JSON.parse(operatingHoursJSON); } catch(e) { return []; }
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayOrder[selectedDate.getDay()];
    const dayHours = operatingHours[dayName];
    if (!dayHours) return [];
    const slots = [];
    const [startH, startM] = dayHours.start.split(':').map(Number);
    const [endH, endM] = dayHours.end.split(':').map(Number);
    let currentTime = new Date();
    currentTime.setHours(startH, startM, 0, 0);
    let endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);
    while(currentTime < endTime) { slots.push(format(currentTime, "HH:mm")); currentTime.setMinutes(currentTime.getMinutes() + 60); }
    return slots;
};


export const BookingFlowModal = ({ vendor, isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Waste Types, 2: Date, 3: Time, 4: Details

    const form = useForm({
        resolver: zodResolver(bookingFlowSchema),
        defaultValues: { wasteTypes: [], pickupDate: null, pickupTime: "", pickupLocation: "", contactPhone: "" },
    });

    const onSubmit = async (data) => {
        try {
            const bookingData = {
                vendorId: vendor.vendorProfile.id,
                pickupLocation: data.pickupLocation,
                wasteTypes: data.wasteTypes,
                pickupTime: new Date(data.pickupDate.getFullYear(), data.pickupDate.getMonth(), data.pickupDate.getDate(), ...data.pickupTime.split(':').map(Number)),
                contactPhone: data.contactPhone,
            };
            await api.post('/bookings', bookingData);
            toast.success(`Booking request sent to ${vendor.vendorProfile.businessName}!`);
            onClose();
        } catch (error) {
            toast.error("Failed to schedule pickup. Please try again.");
        }
    };
    
    useEffect(() => {
        if (!isOpen) { setTimeout(() => { form.reset(); setStep(1); }, 200); }
    }, [isOpen, form]);

    if (!vendor) return null;
    
    const disabledDays = getDisabledDays(vendor.vendorProfile.operatingHours);
    const selectedDate = form.watch('pickupDate');
    const selectedTime = form.watch('pickupTime');
    const timeSlots = generateTimeSlots(vendor.vendorProfile.operatingHours, selectedDate);
    const glassInputStyle = "bg-white/70 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary";
    const steps = ["Waste Types", "Select Date", "Select Time", "Confirm Details"];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white backdrop-blur-xl border-white/50">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        {step > 1 && (<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4"/></Button>)}
                         <DialogTitle>Schedule with {vendor.vendorProfile.businessName}</DialogTitle>
                    </div>
                     <div className="flex items-center space-x-2 pt-2 pl-10">
                        {steps.map((s, index) => (
                             <React.Fragment key={s}>
                                <div className="flex flex-col items-center"><div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step > index + 1 ? "bg-emerald-500 text-white" : step === index + 1 ? "bg-emerald-200 text-emerald-800 ring-2 ring-emerald-400" : "bg-gray-200 text-gray-500")}>{index + 1}</div></div>
                                {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
                            </React.Fragment>
                        ))}
                    </div>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="pt-4">
                        {step === 1 && (
                            <div>
                                <FormField name="wasteTypes" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">What are you disposing of?</FormLabel>
                                        <FormControl><WasteTypeSelector field={field} /></FormControl>
                                        <FormMessage className="text-center pt-2" />
                                    </FormItem>
                                )}/>
                                 <Button 
                                    type="button" 
                                    className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white" 
                                    onClick={async () => {
                                        const isValid = await form.trigger("wasteTypes");
                                        if (isValid) setStep(2);
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                        {step === 2 && (<div className="flex justify-center"><Calendar mode="single" selected={selectedDate} onSelect={(date) => { form.setValue("pickupDate", date, { shouldValidate: true }); setStep(3); }} disabled={disabledDays} initialFocus /></div>)}
                        {step === 3 && (
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.length > 0 ? timeSlots.map(time => (<Button key={time} variant="outline" data-state={selectedTime === time ? 'active' : 'inactive'} className="bg-white/70 data-[state=active]:bg-emerald-500 data-[state=active]:text-white" onClick={() => { form.setValue('pickupTime', time, { shouldValidate: true }); setStep(4); }}>{time}</Button>)) : (<p className="col-span-3 text-center text-sm">No available slots.</p>)}
                            </div>
                        )}
                        {step === 4 && (
                            <div className="space-y-4">
                                <FormField name="pickupLocation" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Pickup Address</FormLabel><FormControl><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input {...field} className={`${glassInputStyle} pl-5`} /></div></FormControl><FormMessage /></FormItem> )}/>
                                <FormField name="contactPhone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input {...field} className={`${glassInputStyle} pl-5`} /></div></FormControl><FormMessage /></FormItem> )}/>
                                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Booking
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

