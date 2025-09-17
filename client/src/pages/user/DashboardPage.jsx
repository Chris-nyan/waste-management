import { useState, useEffect, useMemo } from 'react';
import { Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Pie, Bar, BarChart, PieChart, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, PieChart as PieChartIcon, Weight, Recycle, TrendingUp, Loader2, ServerCrash, Inbox, Calendar, Link as LinkIcon } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, subYears } from 'date-fns';
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

const UpcomingPickupCard = ({ booking }) => (
    <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-5 w-5" />Upcoming Pickup</CardTitle>
            <CardDescription className="text-white/80">Your next scheduled collection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{booking.vendor.businessName}</p>
            <p className="text-sm">{format(new Date(booking.pickupTime), "EEEE, MMM d 'at' h:mm a")}</p>
            <Link to="/user/bookings" className="flex items-center text-sm font-semibold text-white/90 hover:text-white pt-2">
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

                const now = new Date();
                let startDate;
                if (timeFilter === '7d') startDate = subDays(now, 7);
                else if (timeFilter === '30d') startDate = subDays(now, 30);
                else if (timeFilter === '6m') startDate = subMonths(now, 6);
                else if (timeFilter === '1y') startDate = subYears(now, 1);

                const params = startDate ? { startDate: startDate.toISOString() } : {};

                const [statsRes, upcomingRes] = await Promise.all([
                    api.get('/analytics/my-impact', { params }),
                    api.get('/bookings/upcoming')
                ]);
                setStats(statsRes.data);
                setUpcomingBooking(upcomingRes.data);
            } catch (err) {
                setError("Could not load your dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeFilter]);

    const chartData = useMemo(() => {
        if (!stats) return { pieData: [], barData: [] };

        const pieData = Object.entries(stats.breakdown).map(([name, value], index) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            value,
            fill: `hsl(var(--chart-${(index % 5) + 1}))`
        }));

        const barData = stats.timeline.map(item => ({
            date: format(new Date(item.date), "MMM d"),
            Weight: item.totalWeight
        }));

        return { pieData, barData };
    }, [stats]);


    if (loading) return <AppLayout><div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
    if (error) return <AppLayout><div className="text-center py-16 bg-white border rounded-lg"><ServerCrash className="h-12 w-12 mx-auto text-red-400" /><p className="mt-4 text-red-500 font-medium">{error}</p></div></AppLayout>;

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
                        <SelectItem value="1y">Last Year</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {(stats.totalWeight === 0 && timeFilter === 'all') ? (
                <div className="text-center py-16 bg-white/80 backdrop-blur-sm border rounded-lg"><Inbox className="h-12 w-12 mx-auto text-slate-400" /><p className="mt-4 text-slate-600 font-medium">No Data Yet</p><p className="text-sm text-slate-500 mt-2">Stats will appear here after your first completed pickup.</p></div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Disposed" value={stats.totalWeight} unit="kg" icon={Weight} />
                        <StatCard title="Most Disposed" value={Object.keys(stats.breakdown).length > 0 ? Object.keys(stats.breakdown).reduce((a, b) => stats.breakdown[a] > stats.breakdown[b] ? a : b) : 'N/A'} unit="by weight" icon={Recycle} />
                        <StatCard title="Total Pickups" value={stats.timeline.length} unit="completed" icon={TrendingUp} />
                        {upcomingBooking && timeFilter === 'all' ? <UpcomingPickupCard booking={upcomingBooking} /> : <StatCard title="Upcoming Pickups" value="None" unit="No bookings scheduled" icon={Calendar} />}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <Card className="bg-white/50 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-emerald-500" />Collection Timeline</CardTitle><CardDescription>Total weight collected over time</CardDescription></CardHeader>
                            <CardContent className="h-72">
                                {chartData.barData.length > 0 ? (
                                    <ChartContainer>
                                        <BarChart data={chartData.barData}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} /><YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} unit="kg" /><Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} /><Bar dataKey="Weight" fill="hsl(var(--primary))" radius={4} /></BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">No timeline data for this period.</div>
                                )}
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Waste Breakdown Card */}
                            <Card className="bg-white/70 backdrop-blur-sm border-emerald-300/30 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-6 w-6 text-emerald-500" />
                                        Waste Breakdown
                                    </CardTitle>
                                    <CardDescription>Total weight by type</CardDescription>
                                </CardHeader>

                                <CardContent className="h-96 flex items-center justify-center">
                                    {chartData.pieData.length > 0 ? (
                                        <ChartContainer>
                                            <PieChart width={400} height={300}>
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} kg`, name]}
                                                    wrapperStyle={{ zIndex: 1000 }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    align="right"
                                                    verticalAlign="middle"
                                                    wrapperStyle={{ paddingLeft: "10px" }}
                                                    formatter={(value, entry) => (
                                                        <span className="text-gray-700 text-sm">
                                                            {entry.payload.name}{" "}
                                                            <span className="font-semibold text-emerald-600">
                                                                ({entry.payload.value} kg)
                                                            </span>
                                                        </span>
                                                    )}
                                                />
                                                <Pie
                                                    data={[...chartData.pieData].sort((a, b) => b.value - a.value)}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={120}
                                                    paddingAngle={4}
                                                >
                                                    {[...chartData.pieData]
                                                        .sort((a, b) => b.value - a.value)
                                                        .map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            No breakdown data for this period.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Secure Destruction Waste Card */}
                            <Card className="bg-white/70 backdrop-blur-sm border-emerald-300/30 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-6 w-6 text-red-500" />
                                        Secure Destruction Waste
                                    </CardTitle>
                                    <CardDescription>Total weight by type</CardDescription>
                                </CardHeader>

                                <CardContent className="h-96 flex items-center justify-center">
                                    {chartData.secureDestructionData?.length > 0 ? (
                                        <ChartContainer>
                                            <PieChart width={400} height={300}>
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} kg`, name]}
                                                    wrapperStyle={{ zIndex: 1000 }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    align="right"
                                                    verticalAlign="middle"
                                                    wrapperStyle={{ paddingLeft: "10px" }}
                                                    formatter={(value, entry) => (
                                                        <span className="text-gray-700 text-sm">
                                                            {entry.payload.name}{" "}
                                                            <span className="font-semibold text-red-600">
                                                                ({entry.payload.value} kg)
                                                            </span>
                                                        </span>
                                                    )}
                                                />
                                                <Pie
                                                    data={[...chartData.secureDestructionData].sort((a, b) => b.value - a.value)}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={120}
                                                    paddingAngle={4}
                                                >
                                                    {[...chartData.secureDestructionData]
                                                        .sort((a, b) => b.value - a.value)
                                                        .map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            No data yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default DashboardPage;

