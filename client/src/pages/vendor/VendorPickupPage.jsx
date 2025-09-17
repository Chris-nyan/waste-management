import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { MapPin, User, Package, Loader2, ServerCrash, Inbox, Check, X, Truck, BookOpen, ScrollText, Calendar, Recycle, Paperclip, GlassWater, Leaf, Cpu, Hammer } from 'lucide-react';
import api from '@/lib/axios';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// --- START: Data moved from waste-data.js ---
// This data is now local to this component to remove the separate file dependency.
const wasteTypeOptions = [
    { id: 'PLASTIC', label: 'Plastic', icon: Recycle },
    { id: 'PAPER', label: 'Paper', icon: Paperclip },
    { id: 'GLASS', label: 'Glass', icon: GlassWater },
    { id: 'ORGANIC', label: 'Organic', icon: Leaf },
    { id: 'ELECTRONIC', label: 'Electronic', icon: Cpu },
    { id: 'METAL', label: 'Metal', icon: Hammer },
    { id: 'OTHER', label: 'Other', icon: Recycle },
];

const getWasteIcon = (wasteType) => {
    const option = wasteTypeOptions.find(opt => opt.id === wasteType);
    return option ? option.icon : Recycle;
};
// --- END: Data moved from waste-data.js ---


// --- Reusable Booking Card (now more compact) ---
const VendorBookingCard = ({ booking, onViewDetails }) => {
    return (
        <Card className="bg-white/70 backdrop-blur-lg border border-white/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardDescription>Pickup for</CardDescription>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2"><User className="h-5 w-5 text-primary"/>{booking.user.name}</CardTitle>
                </div>
                 <Button size="sm" variant="ghost" onClick={() => onViewDetails(booking)}>View Details</Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm border-t border-emerald-200/50 pt-4">
                <div className="flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-3 text-primary shrink-0" /><span>{format(new Date(booking.pickupTime), "EEE, MMM d, yyyy 'at' h:mm a")}</span></div>
                <div className="flex items-start text-gray-600"><MapPin className="h-4 w-4 mr-3 mt-0.5 text-primary shrink-0" /><span>{booking.pickupLocation}</span></div>
            </CardContent>
        </Card>
    );
};

// --- New: Booking Details Modal ---
const BookingDetailsModal = ({ booking, isOpen, onClose, onStatusChange }) => {
    if (!booking) return null;
    const [isLoading, setIsLoading] = useState(false);
    const formattedWasteTypes = booking.wasteTypes.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(', ');

    const handleUpdateStatus = async (newStatus) => {
        setIsLoading(true);
        try {
            await api.patch(`/bookings/${booking.id}/status`, { status: newStatus });
            onStatusChange(booking.id, newStatus);
            toast.success(`Booking has been ${newStatus.toLowerCase()}.`);
            onClose();
        } catch (error) { toast.error("Failed to update booking status."); } 
        finally { setIsLoading(false); }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-emerald-300/30">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>For pickup on {format(new Date(booking.pickupTime), "MMM d, yyyy")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 border-t border-emerald-200/50">
                    <div className="flex items-start"><User className="h-4 w-4 mr-3 mt-1 text-primary shrink-0" /><div><p className="font-semibold text-gray-700">Client</p><p>{booking.user.name} ({booking.user.email})</p></div></div>
                    <div className="flex items-start"><MapPin className="h-4 w-4 mr-3 mt-1 text-primary shrink-0" /><div><p className="font-semibold text-gray-700">Location</p><p>{booking.pickupLocation}</p></div></div>
                    <div className="flex items-start"><Package className="h-4 w-4 mr-3 mt-1 text-primary shrink-0" /><div><p className="font-semibold text-gray-700">Waste Types</p><p>{formattedWasteTypes}</p></div></div>
                </div>
                 <div className="flex justify-end items-center space-x-2 pt-3 border-t border-emerald-200/50">
                    {booking.status === 'PENDING' && ( <> <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('CANCELLED')} disabled={isLoading}><X className="h-4 w-4 mr-1"/>Decline</Button> <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={() => handleUpdateStatus('CONFIRMED')} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Check className="h-4 w-4 mr-1"/>Confirm</>}</Button> </>)}
                    {booking.status === 'CONFIRMED' && <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus('COMPLETED')} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Truck className="h-4 w-4 mr-1"/>Complete Pickup</>}</Button>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- New: Log Waste Modal ---
const LogWasteModal = ({ booking, isOpen, onClose, onWasteLogged }) => {
    const logWasteSchema = z.object({
        entries: z.array(z.object({
            wasteType: z.string(),
            quantity: z.preprocess((val) => parseFloat(String(val)), z.number().min(0.1, "Quantity must be greater than 0.")),
            unit: z.string().default('kg'),
        }))
    });

    const form = useForm({
        resolver: zodResolver(logWasteSchema),
        defaultValues: {
            entries: booking?.wasteTypes.map(type => ({ wasteType: type, quantity: '' })) || []
        },
    });
    
    useEffect(() => {
        form.reset({
            entries: booking?.wasteTypes.map(type => ({ wasteType: type, quantity: '' })) || []
        });
    }, [booking, form]);

    const onSubmit = async (data) => {
        try {
            await api.post(`/waste-entries/${booking.id}`, { wasteEntries: data.entries });
            toast.success("Waste details have been logged.");
            onWasteLogged(booking.id);
            onClose();
        } catch (error) {
            toast.error("Failed to log waste. Please try again.");
        }
    };
    
    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent className="sm:max-w-lg bg-white/80 backdrop-blur-xl border-emerald-300/30">
                <DialogHeader>
                    <DialogTitle>Log Waste for Booking #{booking.id.substring(0, 8)}</DialogTitle>
                    <DialogDescription>Enter the quantity for each type of waste collected.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        {booking.wasteTypes.map((wasteType, index) => {
                            const Icon = getWasteIcon(wasteType);
                            return (
                                <FormField
                                    key={wasteType}
                                    name={`entries.${index}.quantity`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center text-gray-700"><Icon className="h-4 w-4 mr-2 text-primary"/>{wasteType.charAt(0) + wasteType.slice(1).toLowerCase()}</FormLabel>
                                            <div className="flex items-center">
                                                <FormControl>
                                                    <Input type="number" step="0.1" placeholder="0.0" {...field} className="bg-white/70" />
                                                </FormControl>
                                                <span className="ml-2 text-gray-600 font-semibold">kg</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            );
                        })}
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Submit Log
                        </Button>
                    </form>
                </Form>
             </DialogContent>
        </Dialog>
    )
}

const VendorDashboardPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [logWasteModalOpen, setLogWasteModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchVendorBookings = async () => { 
        try {
            setLoading(true);
            const response = await api.get('/bookings/vendor');
            setBookings(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchVendorBookings(); }, []);

    const handleStatusChange = (bookingId, newStatus) => {
        const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
        setBookings(updatedBookings);
        if (newStatus === 'COMPLETED') {
            setSelectedBooking(updatedBookings.find(b => b.id === bookingId));
            setLogWasteModalOpen(true);
        }
    };
    
    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    const handleWasteLogged = (loggedBookingId) => {
        setBookings(currentBookings => currentBookings.filter(b => b.id !== loggedBookingId));
    };

    const categorizedBookings = useMemo(() => {
        const pending = bookings.filter(b => b.status === 'PENDING');
        const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
        const completed = bookings.filter(b => b.status === 'COMPLETED' && (!b.wasteEntries || b.wasteEntries.length === 0));
        return { pending, confirmed, completed };
    }, [bookings]);
    
    const displayedBookings = categorizedBookings[activeTab] || [];

    return (
        <AppLayout>
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Bookings Dashboard</h2>
                <p className="text-slate-500 mt-1">Manage your incoming pickup requests.</p>
            </div>
            
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('pending')} className={cn("py-3 px-1 border-b-2 font-medium text-sm", activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700')}>Pending ({categorizedBookings.pending.length})</button>
                    <button onClick={() => setActiveTab('confirmed')} className={cn("py-3 px-1 border-b-2 font-medium text-sm", activeTab === 'confirmed' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700')}>Upcoming ({categorizedBookings.confirmed.length})</button>
                    <button onClick={() => setActiveTab('completed')} className={cn("py-3 px-1 border-b-2 font-medium text-sm", activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700')}>Log Waste ({categorizedBookings.completed.length})</button>
                </nav>
            </div>

            <div className="mt-8">
                {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                : error ? <div className="text-center py-16 bg-white border rounded-lg"><ServerCrash className="h-12 w-12 mx-auto text-red-400"/><p className="mt-4 text-red-500 font-medium">{error}</p></div>
                : displayedBookings.length === 0 ? <div className="text-center py-16 bg-white/80 backdrop-blur-sm border rounded-lg"><Inbox className="h-12 w-12 mx-auto text-slate-400"/><p className="mt-4 text-slate-600 font-medium">No bookings in this stage.</p></div>
                : <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">{displayedBookings.map(b => <VendorBookingCard key={b.id} booking={b} onViewDetails={handleViewDetails}/>)}</div>
                }
            </div>

            <BookingDetailsModal booking={selectedBooking} isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} onStatusChange={handleStatusChange} />
            <LogWasteModal booking={selectedBooking} isOpen={logWasteModalOpen} onClose={() => setLogWasteModalOpen(false)} onWasteLogged={handleWasteLogged} />
        </AppLayout>
    );
};

export default VendorDashboardPage;

