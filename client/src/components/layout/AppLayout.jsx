import { useState } from 'react';
import { LayoutGrid, Calendar, LogOut, Menu, Bell, ChevronsLeft, ChevronsRight, BarChart3, ShieldCheck, Settings, LayoutDashboard, UserPlus, Users, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { InviteVendorModal } from '@/components/ui/InviteVendorModal';

const NavLink = ({ to, icon: Icon, children, active, isCollapsed }) => (
    <Link to={to} className={cn('flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl', active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white/10 border border-white/20 backdrop-blur-md text-white/80 shadow-md hover:bg-white/20')}>
        <Icon className="h-5 w-5 shrink-0" />
        <span className={cn('ml-3 transition-opacity duration-200', isCollapsed && 'opacity-0')}>{children}</span>
    </Link>
);

const SidebarContent = ({ user, logout, isCollapsed, toggleSidebar, onInviteClick }) => {
    const { pathname } = useLocation();
    return (
        <div className="flex flex-col h-full text-white">
            <div className={`flex items-center justify-between h-20 px-4 shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
                {!isCollapsed && (<div className="flex items-center space-x-3"> <h1 className="text-2xl font-bold tracking-tight">{user?.role === 'VENDOR' ? "Vendor Portal" : user?.role === 'ADMIN' ? 'Admin Panel' : "RecyGlo"}</h1></div>)}
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-white/20 transition-colors">{isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}</button>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-3">
                {user?.role === 'USER' && (
                    <>
                        <NavLink to="/user/dashboard" icon={BarChart3} active={pathname.startsWith('/user/dashboard')} isCollapsed={isCollapsed}>My Impact</NavLink>
                        <NavLink to="/user/find-vendor" icon={LayoutGrid} active={pathname === '/user/find-vendor'} isCollapsed={isCollapsed}>Find a Vendor</NavLink>
                        <NavLink to="/user/bookings" icon={Calendar} active={pathname === '/user/bookings'} isCollapsed={isCollapsed}>My Bookings</NavLink>
                        <NavLink to="/user/secure-destruction" icon={ShieldCheck} active={pathname.startsWith('/user/secure-destruction')} isCollapsed={isCollapsed}>Secure Destruction</NavLink>
                    </>
                )}
                {user?.role === 'VENDOR' && (
                    <>
                        <NavLink to="/vendor/impact" icon={BarChart3} active={pathname.startsWith('/vendor/impact')} isCollapsed={isCollapsed}>Impact Dashboard</NavLink>
                        <NavLink to="/vendor/dashboard" icon={Package} active={pathname.startsWith('/vendor/dashboard')} isCollapsed={isCollapsed}>Pickup Bookings</NavLink>
                        <NavLink to="/vendor/calendar" icon={Calendar} active={pathname === '/vendor/calendar'} isCollapsed={isCollapsed}>My Calendar</NavLink>
                        <NavLink to="/vendor/profile" icon={Settings} active={pathname === '/vendor/profile'} isCollapsed={isCollapsed}>My Profile</NavLink>
                    </>
                )}
                {user?.role === 'ADMIN' && (
                    <>
                        <NavLink to="/admin/dashboard" icon={LayoutDashboard} active={pathname.startsWith('/admin/dashboard')} isCollapsed={isCollapsed}>Dashboard</NavLink>
                        <NavLink to="/user/find-vendor" icon={LayoutGrid} active={pathname === '/user/find-vendor'} isCollapsed={isCollapsed}>Manage Vendors</NavLink>
                        <NavLink to="/admin/bookings" icon={Calendar} active={pathname === '/admin/bookings'} isCollapsed={isCollapsed}>All Bookings</NavLink>
                        <NavLink to="/admin/users" icon={Users} active={pathname === '/admin/users'} isCollapsed={isCollapsed}>Manage Users</NavLink>
                    </>
                )}
            </nav>
            {user?.role === 'ADMIN' && (
                <div className="px-4 py-2">
                    <button onClick={onInviteClick} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl bg-white/10 border border-white/20 backdrop-blur-md text-white/80 shadow-md hover:bg-white/20 ${isCollapsed ? 'justify-center' : ''}`}>
                        <UserPlus className="h-5 w-5 shrink-0" />
                        <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Invite Vendor</span>
                    </button>
                </div>
            )}
            <div className="p-4">
                <div className={`flex items-center p-2 rounded-lg bg-black/20 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center ring-2 ring-white/50 shrink-0"><span className="font-bold text-primary">{user?.name?.charAt(0)}</span></div>
                    {!isCollapsed && (<> <div className="flex-1 overflow-hidden ml-3"><p className="text-sm font-semibold text-white truncate">{user?.name}</p><p className="text-xs text-white/70 truncate">{user?.email}</p></div><button onClick={logout} className="text-white/70 hover:text-white ml-2 p-2 rounded-full hover:bg-white/20 transition-colors shrink-0"><LogOut className="h-5 w-5" /></button></>)}
                </div>
            </div>
        </div>
    );
};

const AppLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="flex h-screen bg-slate-100 font-poppins">
            <style>{`.sidebar-bg::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; opacity: 0.3; z-index: -1; }`}</style>
            <aside className={`hidden lg:flex flex-col bg-white/60 backdrop-blur-xl border-r border-white/80 shadow-sm z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="sidebar-bg absolute inset-0 h-full w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 -z-20"></div>
                <SidebarContent user={user} logout={logout} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} onInviteClick={() => setIsInviteModalOpen(true)} />
            </aside>
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)}></div>
                <div className={`sidebar-bg relative flex flex-col w-72 h-full bg-white/80 backdrop-blur-xl border-r border-white/80 shadow-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 opacity-95 -z-20"></div>
                    <SidebarContent user={user} logout={logout} isCollapsed={false} toggleSidebar={() => { }} onInviteClick={() => { setIsInviteModalOpen(true); setIsSidebarOpen(false); }} />
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white/70 backdrop-blur-lg border-b flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden"><Menu className="h-6 w-6 text-gray-600" /></button>
                        <h1 className="text-lg font-bold text-gray-800 lg:hidden">RecyGlo</h1>
                    </div>
                    <div className="ml-auto">
                        <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            <InviteVendorModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    );
};

export default AppLayout;

