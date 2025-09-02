import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Calendar, MapPin, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Visual Progress Bar Component ---
const BookingProgressBar = ({ status }) => {
    const steps = [
        { name: 'Pending', status: 'PENDING', icon: Clock },
        { name: 'Confirmed', status: 'CONFIRMED', icon: CheckCircle },
        { name: 'Completed', status: 'COMPLETED', icon: Truck }
    ];

    const currentStepIndex = steps.findIndex(step => step.status === status);

    // If status is CANCELLED, show a different state
    if (status === 'CANCELLED') {
        return (
            <div className="flex items-center justify-center p-4 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="h-6 w-6 text-red-500 mr-3" />
                <p className="font-semibold text-red-700">This booking has been cancelled.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div key={step.name} className="flex flex-col items-center z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                            index <= currentStepIndex ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                        )}>
                            <step.icon className="h-5 w-5" />
                        </div>
                        <p className={cn(
                            "mt-2 text-xs font-semibold",
                            index <= currentStepIndex ? 'text-emerald-600' : 'text-gray-500'
                        )}>
                            {step.name}
                        </p>
                    </div>
                ))}
            </div>
            {/* The progress line */}
            <div className="relative w-10/12 mx-auto h-1 bg-gray-200 -mt-7">
                <div 
                    className="absolute top-0 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};


export const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white backdrop-blur-xl border-emerald-300/30">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Booking Details</DialogTitle>
                    <DialogDescription>
                        Status and information for your pickup with {booking.vendor.businessName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-8">
                    <BookingProgressBar status={booking.status} />
                </div>

                <div className="space-y-4 text-sm text-gray-700 border-t pt-6">
                     <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Pickup Date & Time</p>
                            <p className="text-gray-600">{format(new Date(booking.pickupTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-4 text-primary shrink-0 mt-0.5" />
                         <div>
                            <p className="font-semibold">Pickup Location</p>
                            <p className="text-gray-600">{booking.pickupLocation}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
