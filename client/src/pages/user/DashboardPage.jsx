import { useState, useEffect, useMemo } from 'react';
import { Area, Bar, Pie, BarChart, PieChart, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, PieChart as PieChartIcon, Weight, Recycle, TrendingUp, Loader2, ServerCrash, Inbox, Calendar, Link as LinkIcon } from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';
import api from '@/lib/axios';
import AppLayout from '@/components/layout/AppLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, unit }) => (
    <Card className="bg-white/50 backdrop-blur-sm border-emerald-300/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <Icon className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <p className="text-xs text-gray-500">{unit}</p>
        </CardContent>
    </Card>
);

// --- New Component for the Upcoming Pickup Card ---
const UpcomingPickupCard = ({ booking }) => (
    <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-5 w-5"/>Upcoming Pickup</CardTitle>
            <CardDescription className="text-white/80">Your next scheduled collection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{booking.vendor.businessName}</p>
            <p className="text-sm">{format(new Date(booking.pickupTime), "EEEE, MMM d 'at' h:mm a")}</p>
            <Link to="/user/mybookings" className="flex items-center text-sm font-semibold text-white/90 hover:text-white pt-2">
                View All Bookings <LinkIcon className="h-4 w-4 ml-2" />
            </Link>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [upcomingBooking, setUpcomingBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch both stats and upcoming booking in parallel for speed
                const [statsRes, upcomingRes] = await Promise.all([
                    api.get('/analytics/my-impact'),
                    api.get('/bookings/upcoming')
                ]);
                setStats(statsRes.data);
                setUpcomingBooking(upcomingRes.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Could not load your dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        if (!stats) return { pieData: [], barData: [], totalWeight: 0, mostDisposed: 'N/A', totalPickups: 0 };
        
        const now = new Date();
        let startDate;
        if (timeFilter === '7d') startDate = subDays(now, 7);
        else if (timeFilter === '30d') startDate = subDays(now, 30);
        else if (timeFilter === 'month') startDate = startOfMonth(now);
        else startDate = new Date(0); // 'all time'

        const filteredTimeline = stats.timeline.filter(item => new Date(item.date) >= startDate);
        
        // Note: Client-side filtering of breakdown is complex without all data points.
        // For now, the pie chart and stat cards show "All Time" data.
        // A more advanced implementation would have the API accept date range parameters.
        const pieData = Object.entries(stats.breakdown).map(([name, value], index) => ({ 
            name, 
            value, 
            fill: `hsl(var(--chart-${(index % 5) + 1}))` 
        }));
        
        const barData = filteredTimeline.map(item => ({ 
            date: format(new Date(item.date), "MMM d"), 
            Weight: item.totalWeight 
        }));
        
        return { 
            pieData, 
            barData, 
            totalWeight: stats.totalWeight,
            mostDisposed: Object.keys(stats.breakdown).length > 0 ? Object.keys(stats.breakdown).reduce((a, b) => stats.breakdown[a] > stats.breakdown[b] ? a : b) : 'N/A',
            totalPickups: stats.timeline.length
        };
    }, [stats, timeFilter]);

    if (loading) return <AppLayout><div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
    if (error) return <AppLayout><div className="text-center py-16 bg-white border rounded-lg"><ServerCrash className="h-12 w-12 mx-auto text-red-400"/><p className="mt-4 text-red-500 font-medium">{error}</p></div></AppLayout>;

    return (
        <AppLayout>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">My Impact Dashboard</h2>
                    <p className="text-slate-500 mt-1">Your personal waste disposal summary.</p>
                </div>
                 <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white"><SelectValue placeholder="Filter by date" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {stats.totalWeight === 0 ? (
                 <div className="text-center py-16 bg-white/80 backdrop-blur-sm border rounded-lg"><Inbox className="h-12 w-12 mx-auto text-slate-400"/><p className="mt-4 text-slate-600 font-medium">No Data Yet</p><p className="text-sm text-slate-500 mt-2">Stats will appear here after your first completed pickup.</p></div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Waste Disposed" value={filteredData.totalWeight} unit="kg" icon={Weight} />
                        <StatCard title="Most Disposed Item" value={filteredData.mostDisposed} unit="by weight" icon={Recycle} />
                        <StatCard title="Total Pickups" value={filteredData.totalPickups} unit="completed" icon={TrendingUp} />
                        {upcomingBooking ? <UpcomingPickupCard booking={upcomingBooking} /> : <StatCard title="Upcoming Pickups" value="None" unit="No bookings scheduled" icon={Calendar} />}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="lg:col-span-2 bg-white/50 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-emerald-500"/>Waste Breakdown</CardTitle><CardDescription>Total weight by type (All Time)</CardDescription></CardHeader>
                            <CardContent>
                                <ChartContainer><PieChart><Pie data={filteredData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label /></PieChart></ChartContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3 bg-white/50 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-emerald-500"/>Disposal Timeline</CardTitle><CardDescription>Total weight disposed over time</CardDescription></CardHeader>
                            <CardContent>
                                <ChartContainer><BarChart data={filteredData.barData}><Bar dataKey="Weight" fill="var(--color-primary)" radius={4} /></BarChart></ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default DashboardPage;

