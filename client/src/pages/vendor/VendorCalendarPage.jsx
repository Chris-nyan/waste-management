import { useState, useEffect, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { MapPin, User, Package, Loader2, ServerCrash, Inbox, Check, X, Truck, Calendar as CalendarIcon } from 'lucide-react';
import api from '@/lib/axios';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import useAuth from '@/hooks/use-auth';

// --- Reusable Components ---
const StatusBadge = ({ status }) => {
    const statusInfo = {
        PENDING: { className: "bg-amber-100 text-amber-800" },
        CONFIRMED: { className: "bg-sky-100 text-sky-800" },
        COMPLETED: { className: "bg-emerald-100 text-emerald-800" },
        CANCELLED: { className: "bg-red-100 text-red-800" },
    };
    const currentStatus = statusInfo[status] || { className: "bg-gray-100 text-gray-800" };
    return (<span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", currentStatus.className)}>{status}</span>);
};

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
                    {booking.status === 'PENDING' && (<> <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('CANCELLED')} disabled={isLoading}><X className="h-4 w-4 mr-1" />Decline</Button> <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={() => handleUpdateStatus('CONFIRMED')} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Confirm</>}</Button> </>)}
                    {booking.status === 'CONFIRMED' && <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleUpdateStatus('COMPLETED')} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Truck className="h-4 w-4 mr-1" />Complete Pickup</>}</Button>}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const VendorCalendarPage = () => {
    const { user } = useAuth(); // 2. Get the current user from our auth hook
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchVendorBookings = async () => {
            try {
                const response = await api.get('/bookings/vendor');
                console.log('Vendor bookings:', response.data);
                setBookings(response.data);
            } catch (err) {
                setError("Could not load your schedule.");
            } finally {
                setLoading(false);
            }
        };
        fetchVendorBookings();
    }, []);

    const handleStatusChange = (bookingId, newStatus) => {
        setBookings(currentBookings =>
            currentBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
        );
    };

    const eventDays = useMemo(() => bookings.map(b => new Date(b.pickupTime)), [bookings]);

    const bookingsForSelectedDay = useMemo(() => {
        return bookings
            .filter(b => isSameDay(new Date(b.pickupTime), selectedDate))
            .sort((a, b) => new Date(a.pickupTime) - new Date(b.pickupTime));
    }, [bookings, selectedDate]);

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    if (loading) return <AppLayout><div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
    if (error) return <AppLayout><div className="text-center py-16 bg-white border rounded-lg"><ServerCrash className="h-12 w-12 mx-auto text-red-400" /><p className="mt-4 text-red-500 font-medium">{error}</p></div></AppLayout>;

    return (
        <AppLayout>
            <div className="mb-3">
                <h2 className="text-2xl md:text-3xl font-bold text-grey-800">
                    Hello  <span className="text-emerald-600">{user?.name}, 👋</span>
                </h2>
                <p className="text-slate-600 mt-2 max-w-xl">
                    Here’s your schedule of your
                    <span className="font-small text-emerald-700"> confirmed and pending pickups</span>

                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm p-2">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ event: eventDays }}
                        className="w-full"
                    />
                </Card>
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-emerald-300/30 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">
                        Schedule for {format(selectedDate, "MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                        {bookingsForSelectedDay.length > 0 ? (
                            bookingsForSelectedDay.map(booking => (
                                <Card key={booking.id} className="bg-white/70 backdrop-blur-lg border border-white/30 cursor-pointer hover:bg-emerald-50/50 transition-all hover:shadow-lg hover:-translate-y-1" onClick={() => handleViewDetails(booking)}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-700">{format(new Date(booking.pickupTime), "h:mm a")}</p>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 mt-2">{booking.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">Contact: {booking.contactPhone}</p>

                                        <p className="text-xs text-gray-500 truncate">Location: {booking.pickupLocation}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-sm text-slate-500 bg-white/50 rounded-lg p-8">
                                <Inbox className="h-10 w-10 text-slate-400 mb-4" />
                                <p className="font-semibold text-slate-600">No pickups scheduled</p>
                                <p className="text-xs">This day is clear.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BookingDetailsModal
                booking={selectedBooking}
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                onStatusChange={handleStatusChange}
            />
        </AppLayout>
    );
};

export default VendorCalendarPage;