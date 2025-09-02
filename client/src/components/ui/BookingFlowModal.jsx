import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from "date-fns";
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

// --- Zod Schema for the complete booking flow ---
const bookingFlowSchema = z.object({
    pickupDate: z.date({ required_error: "Please select a pickup date." }),
    pickupTime: z.string({ required_error: "Please select a pickup time." }),
    pickupLocation: z.string().min(10, { message: "Please enter a full pickup address." }),
    phone: z.string().min(10, { message: "A valid phone number is required." }),
});

// --- Helper functions ---
const getDisabledDays = (operatingHoursJSON) => {
    let operatingHours = {};
    try {
        operatingHours = JSON.parse(operatingHoursJSON || '{}');
    } catch (e) { return []; }
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const availableDays = Object.keys(operatingHours).map(day => dayMap[day]);
    return [
        { dayOfWeek: [0, 1, 2, 3, 4, 5, 6].filter(day => !availableDays.includes(day)) },
        { before: new Date(new Date().setHours(0, 0, 0, 0)) }
    ];
};

const generateTimeSlots = (operatingHoursJSON, selectedDate) => {
    if (!operatingHoursJSON || !selectedDate) return [];
    let operatingHours = {};
    try {
        operatingHours = JSON.parse(operatingHoursJSON);
    } catch (e) { return []; }
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

    while (currentTime < endTime) {
        slots.push(format(currentTime, "HH:mm"));
        currentTime.setMinutes(currentTime.getMinutes() + 60); // 1-hour slots
    }
    return slots;
};


export const BookingFlowModal = ({ vendor, isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Details

    const form = useForm({
        resolver: zodResolver(bookingFlowSchema),
        defaultValues: {
            pickupDate: null,
            pickupTime: "",
            pickupLocation: "",
            phone: ""
        },
    });

    const onSubmit = async (data) => {
        try {
            const bookingData = {
                vendorId: vendor.vendorProfile.id,
                pickupLocation: data.pickupLocation,
                pickupTime: new Date(
                    data.pickupDate.getFullYear(),
                    data.pickupDate.getMonth(),
                    data.pickupDate.getDate(),
                    ...data.pickupTime.split(':').map(Number)
                ),
            };
            await api.post('/bookings', bookingData);
            toast.success(`Booking request sent to ${vendor.vendorProfile.businessName}!`);
            onClose();
        } catch (error) {
            toast.error("Failed to schedule pickup. Please try again.");
        }
    };

    useEffect(() => {
        if (!isOpen) {
            // Use a timeout to allow the closing animation to finish before resetting
            setTimeout(() => {
                form.reset();
                setStep(1);
            }, 200);
        }
    }, [isOpen, form]);

    if (!vendor) return null;

    const disabledDays = getDisabledDays(vendor.vendorProfile.operatingHours);
    const selectedDate = form.watch('pickupDate');
    const timeSlots = generateTimeSlots(vendor.vendorProfile.operatingHours, selectedDate);
    const glassInputStyle = "bg-white/70 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white backdrop-blur-lg border-emerald-300">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        {step > 1 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep(step - 1)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DialogTitle>Schedule with {vendor.vendorProfile.businessName}</DialogTitle>
                    </div>
                    <DialogDescription className="pl-20 pt-5">
                        {step === 1 && "Select an available day for your pickup."}
                        {step === 2 && `Available times for ${format(selectedDate, "PPP")}.`}
                        {step === 3 && "Please confirm your pickup details."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex justify-center pt-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                form.setValue("pickupDate", date, { shouldValidate: true });
                                setStep(2);
                            }}
                            disabled={disabledDays}
                            initialFocus
                            className="rounded-md border w-full max-w-sm bg-white"
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-3 gap-3 pt-4">
                        {timeSlots.length > 0 ? timeSlots.map(time => (
                            <Button
                                key={time}
                                variant="outline"
                                className="bg-white/70"
                                onClick={() => {
                                    form.setValue('pickupTime', time, { shouldValidate: true });
                                    setStep(3);
                                }}
                            >
                                {time}
                            </Button>
                        )) : (
                            <p className="col-span-3 text-center text-sm text-gray-500">No available time slots for this day.</p>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField name="pickupLocation" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pickup Address</FormLabel>
                                    <FormControl><Input placeholder="e.g., 123 Green St, Metropolis" {...field} className={glassInputStyle} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="phone" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl><Input placeholder="Your contact number" {...field} className={glassInputStyle} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Booking
                            </Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};

