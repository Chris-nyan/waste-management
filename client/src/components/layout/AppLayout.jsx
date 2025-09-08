import { useState } from 'react';
import { LayoutGrid, Calendar, LogOut, Menu, Bell, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/use-auth';

// The NavLink component now uses React Router's Link for navigation
const NavLink = ({ to, icon: Icon, children, active, isCollapsed }) => (
    <Link to={to} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl ${active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white/10 border border-white/20 backdrop-blur-md text-white/80 shadow-md hover:bg-white/20'}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{children}</span>
    </Link>
);

// The main sidebar content, now aware of its collapsed state
const SidebarContent = ({ user, logout, isCollapsed, toggleSidebar }) => {
    const { pathname } = useLocation();

    return (
        <div className="flex flex-col h-full text-white">
            <div className={`flex items-center justify-between h-20 px-4 shrink-0 ${isCollapsed ? 'px-4' : 'px-6'}`}>
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        {/* <svg className="h-9 w-9 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> */}
                        <h1 className="text-2xl font-bold tracking-tight">RecyGlo</h1>
                    </div>
                )}
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                    {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                </button>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-3">
                <NavLink to="/user/dashboard" icon={LayoutGrid} active={pathname === '/user/dashboard'} isCollapsed={isCollapsed}>Dashboard</NavLink>
                <NavLink to="/user/find-vendors" icon={LayoutGrid} active={pathname === '/user/find-vendors'} isCollapsed={isCollapsed}>Find Vendors</NavLink>
                <NavLink to="/user/mybookings" icon={Calendar} active={pathname === '/user/mybookings'} isCollapsed={isCollapsed}>My Bookings</NavLink>
            </nav>
            <div className="p-4">
                <div className={`flex items-center p-2 rounded-lg bg-white/20 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center ring-2 ring-white/50 shrink-0">
                        <span className="font-bold text-primary">{user?.name?.charAt(0)}</span>
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 overflow-hidden ml-3">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-white/70 truncate">{user?.email}</p>
                            </div>
                            <button onClick={logout} className="text-white/70 hover:text-white ml-2 p-2 rounded-full hover:bg-white/20 transition-colors shrink-0">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// The main AppLayout component with new functionality
const AppLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
    const [isCollapsed, setIsCollapsed] = useState(false); // For desktop

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="flex h-screen bg-slate-100 font-poppins">
            <style>
                {`
                    .sidebar-bg::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                        background-size: 20px 20px;
                        opacity: 0.3;
                        z-index: -1;
                    }
                `}
            </style>

            {/* Desktop Sidebar with Glassmorphism */}
            <aside className={`hidden lg:flex flex-col bg-white/60 backdrop-blur-xl border-r border-white/80 shadow-sm z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="sidebar-bg absolute inset-0 h-full w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 -z-20"></div>
                <SidebarContent user={user} logout={logout} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            </aside>

            {/* Mobile Sidebar & Overlay */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-white/90" onClick={() => setIsSidebarOpen(false)}></div>
                <div className={`sidebar-bg relative flex flex-col w-72 h-full bg-white/80 backdrop-blur-xl border-r border-white/80 shadow-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 opacity-95 -z-20"></div>
                    <SidebarContent user={user} logout={logout} isCollapsed={false} toggleSidebar={() => { }} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="relative bg-white/70 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
                    {/* Gradient Bottom Border */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600"></div>

                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden">
                            <Menu className="h-6 w-6 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800 lg:hidden">RecyGlo</h1>
                    </div>

                    {/* --- Notification Bar --- */}
                    <div className="ml-auto">
                        <button className="relative group p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />

                            {/* Notification Badge */}
                            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                3
                            </span>

                            {/* Tooltip on hover */}
                            <span className="absolute right-1/2 translate-x-1/2 top-10 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                                Notifications
                            </span>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

