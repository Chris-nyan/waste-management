import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Loader2, ServerCrash, Inbox, Clock, CheckCircle, XCircle } from 'lucide-react';

import api from '@/lib/axios';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookingDetailsModal } from '@/components/ui/BookingDetailModal'; // 1. Import the new modal

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
    const statusInfo = {
        PENDING: { icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200" },
        CONFIRMED: { icon: Calendar, className: "bg-sky-100 text-sky-800 border-sky-200" },
        COMPLETED: { icon: CheckCircle, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        CANCELLED: { icon: XCircle, className: "bg-red-100 text-red-800 border-red-200" },
    };
    const currentStatus = statusInfo[status] || { icon: Clock, className: "bg-gray-100 text-gray-800" };
    const Icon = currentStatus.icon;
    return (<span className={cn("flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border", currentStatus.className)}><Icon className="h-3.5 w-3.5 mr-1.5" />{status}</span>);
};

// --- Booking Card Component ---
const BookingCard = ({ booking, onViewDetails }) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm border border-emerald-300/30 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-300/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-emerald-200/50">
                <div>
                    <p className="text-sm text-gray-500">Booking with</p>
                    <h3 className="text-lg font-bold text-gray-800">{booking.vendor.businessName}</h3>
                </div>
                <div className="mt-2 sm:mt-0"><StatusBadge status={booking.status} /></div>
            </div>
            <div className="space-y-3 text-sm text-gray-600 pt-4">
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-primary shrink-0" /><span>{format(new Date(booking.pickupTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span></div>
                <div className="flex items-center"><MapPin className="h-4 w-4 mr-3 text-primary shrink-0" /><span>{booking.pickupLocation}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-200/50 flex justify-end">
                {/* 2. Add the onClick handler to the button */}
                <Button variant="ghost" size="sm" className="text-primary hover:bg-emerald-50" onClick={() => onViewDetails(booking)}>View Details</Button>
            </div>
        </div>
    );
};

// --- Skeleton Loader for Booking Card ---
const BookingCardSkeleton = () => (<div className="bg-white/50 backdrop-blur-sm border border-emerald-300/30 rounded-lg p-6 animate-pulse"><div className="flex justify-between items-center mb-4 pb-4 border-b border-emerald-200/50"><div className="space-y-2"><div className="h-3 bg-slate-200 rounded w-24"></div><div className="h-5 bg-slate-200 rounded w-40"></div></div><div className="h-6 bg-slate-200 rounded-full w-20"></div></div><div className="space-y-3 pt-4"><div className="h-4 bg-slate-200 rounded w-full"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div>);

// --- Main Bookings Page Component ---
const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // 3. Add state management for the modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings/mybookings');
        setBookings(response.data);
      } catch (err) {
        setError("Something went wrong. We couldn't load your bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.pickupTime) >= now && b.status !== 'CANCELLED' && b.status !== 'COMPLETED');
    const past = bookings.filter(b => new Date(b.pickupTime) < now || b.status === 'CANCELLED' || b.status === 'COMPLETED');
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  
  // 4. Create handlers to open and close the modal
  const handleViewDetails = (booking) => {
      setSelectedBooking(booking);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setTimeout(() => setSelectedBooking(null), 300); // Delay clearing for animation
  };

  return (
    <AppLayout>
      <div>
        <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>
        <p className="text-slate-500 mt-1">View your past and upcoming waste pickups.</p>

        <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('upcoming')} className={cn("py-3 px-1 border-b-2 font-medium text-sm", activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>Upcoming ({upcomingBookings.length})</button>
                <button onClick={() => setActiveTab('past')} className={cn("py-3 px-1 border-b-2 font-medium text-sm", activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>Past ({pastBookings.length})</button>
            </nav>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <BookingCardSkeleton key={i} />)}</div>
          ) : error ? (
            <div className="text-center py-16 bg-white border rounded-lg"><ServerCrash className="h-12 w-12 mx-auto text-red-400"/><p className="mt-4 text-red-500 font-medium">{error}</p><p className="text-sm text-slate-500 mt-2">Please try refreshing the page.</p></div>
          ) : displayedBookings.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm border rounded-lg"><Inbox className="h-12 w-12 mx-auto text-slate-400"/><p className="mt-4 text-slate-600 font-medium">You have no {activeTab} bookings.</p></div>
          ) : (
            <div className="space-y-4">
              {/* 5. Pass the handler to each card */}
              {displayedBookings.map((booking) => (<BookingCard key={booking.id} booking={booking} onViewDetails={handleViewDetails} />))}
            </div>
          )}
        </div>
      </div>
      {/* 6. Add the modal component to the page */}
      <BookingDetailsModal booking={selectedBooking} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
};

export default BookingsPage;

