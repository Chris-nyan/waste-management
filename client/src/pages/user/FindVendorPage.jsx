import { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Phone, Search, Loader2, UserPlus, Globe } from 'lucide-react';
import api from '@/lib/axios';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingFlowModal } from '@/components/ui/BookingFlowModal';
import { InviteVendorModal } from '@/components/ui/InviteVendorModal';
import useAuth from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCountries, fetchStates, fetchCities } from "@/lib/location-api";

// --- Helper & Card Components ---
const getVendorStatus = (operatingHoursJSON) => {
    if (!operatingHoursJSON) return { text: 'Hours not available', color: 'text-gray-400' };
    try {
        const operatingHours = JSON.parse(operatingHoursJSON);
        if (Object.keys(operatingHours).length === 0) return { text: 'Not available', color: 'text-gray-500' };
        const now = new Date();
        const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayName = dayOrder[now.getDay()];
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const todayHours = operatingHours[currentDayName];
        if (todayHours) {
            const [startH, startM] = todayHours.start.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const [endH, endM] = todayHours.end.split(':').map(Number);
            const endTime = endH * 60 + endM;
            if (currentTime >= startTime && currentTime < endTime) {
                return { text: `Open now • Closes at ${todayHours.end}`, color: 'text-green-600 font-semibold' };
            }
        }
        const currentDayIndex = now.getDay();
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (currentDayIndex + i) % 7;
            const nextDayName = dayOrder[nextDayIndex];
            if (operatingHours[nextDayName]) {
                return { text: `Closed • Opens ${nextDayName.substring(0, 3)} at ${operatingHours[nextDayName].start}`, color: 'text-red-500' };
            }
        }
        return { text: 'Closed', color: 'text-red-500' };
    } catch (e) {
        return { text: 'Hours format error', color: 'text-red-500' };
    }
};

const VendorCard = ({ vendor, onSchedule }) => {
    const { vendorProfile } = vendor;
    const fullAddress = `${vendorProfile.street}, ${vendorProfile.district}, ${vendorProfile.city}, ${vendorProfile.country}`;
    const status = getVendorStatus(vendorProfile.operatingHours);

    return (
        <div className="bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 pr-2">{vendorProfile.businessName}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${vendorProfile.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {vendorProfile.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                <div className="space-y-3 text-sm text-gray-600 mt-4">
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-3 text-primary shrink-0" /><span>{fullAddress}</span></div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-3 text-primary shrink-0" /><span className={status.color}>{status.text}</span></div>
                    <div className="flex items-center"><Phone className="h-4 w-4 mr-3 text-primary shrink-0" /><span>{vendorProfile.phone}</span></div>
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <Button onClick={() => onSchedule(vendor)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow hover:opacity-95">
                    Schedule Pickup
                </Button>
            </div>
        </div>
    );
};

const VendorCardSkeleton = () => (<div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div><div className="space-y-3"><div className="h-4 bg-slate-200 rounded w-full"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div><div className="h-4 bg-slate-200 rounded w-1/2"></div></div><div className="h-10 bg-slate-200 rounded w-full mt-6"></div></div>);


const FindVendorPage = () => {
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isStateLoading, setIsStateLoading] = useState(false);
    const [isCityLoading, setIsCityLoading] = useState(false);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    useEffect(() => {
        fetchCountries().then(setCountries);
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            setIsStateLoading(true);
            setSelectedState("");
            setSelectedCity("");
            fetchStates(selectedCountry).then(setStates).finally(() => setIsStateLoading(false));
        } else {
            setStates([]);
            setCities([]);
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedCountry && selectedState) {
            setIsCityLoading(true);
            setSelectedCity("");
            fetchCities(selectedCountry, selectedState).then(setCities).finally(() => setIsCityLoading(false));
        } else {
            setCities([]);
        }
    }, [selectedState]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const params = {
                    country: selectedCountry,
                    city: selectedState,
                    district: selectedCity,
                };
                // Remove empty params to avoid sending them to the API
                Object.keys(params).forEach(key => !params[key] && delete params[key]);

                const response = await api.get('/vendors', { params });
                setVendors(response.data);
                setError(null);
            } catch (err) {
                setError("Could not load vendors.");
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [selectedCountry, selectedState, selectedCity]);

    const handleScheduleClick = (vendor) => {
        setSelectedVendor(vendor);
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setTimeout(() => setSelectedVendor(null), 200);
    };
    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedCountry("");
        setSelectedState("");
        setSelectedCity("");
        // The useEffect hooks will automatically handle resetting the dropdowns
    };

    // Frontend text search now filters the data returned from the API
    const filteredVendors = vendors.filter(vendor =>
        searchQuery === "" ||
        vendor.vendorProfile.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Find a Vendor</h2>
                    <p className="text-slate-500 mt-1">Browse and schedule pickups from local vendors.</p>
                </div>

                <Button onClick={() => setIsInviteModalOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow hover:opacity-95 shrink-0">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Vendor
                </Button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-white rounded-lg border shadow-sm">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input type="text" placeholder="Search by business name..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger><div className="flex items-center gap-2"><Globe className="h-4 w-4" /><span>{selectedCountry || "Country"}</span></div></SelectTrigger>
                    <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry || isStateLoading}>
                    <SelectTrigger>{isStateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (selectedState || "Province / State")}</SelectTrigger>
                    <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState || isCityLoading}>
                    <SelectTrigger>{isCityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (selectedCity || "District / City")}</SelectTrigger>
                    <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={handleClearFilters} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow hover:opacity-95 shrink-0">Clear Filters</Button>

            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <VendorCardSkeleton key={i} />)}
                </div>
            ) : error ? (
                <div className="text-center py-16 bg-white border rounded-lg"><p className="text-red-500 font-medium">{error}</p></div>
            ) : filteredVendors.length === 0 ? (
                <div className="text-center py-16 bg-white border rounded-lg">
                    <p className="text-slate-600 font-medium">No vendors match your search or filter criteria.</p>
                    {(searchQuery || selectedCountry) && <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCountry(""); setSelectedState(""); setSelectedCity(""); }}>Clear Filters</Button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVendors.map(vendor => (
                        <VendorCard key={vendor.id} vendor={vendor} onSchedule={handleScheduleClick} />
                    ))}
                </div>
            )}

            <BookingFlowModal vendor={selectedVendor} isOpen={isBookingModalOpen} onClose={handleCloseBookingModal} />
            <InviteVendorModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </AppLayout>
    );
};

export default FindVendorPage;

