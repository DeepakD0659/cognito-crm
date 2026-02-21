import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ChefHat, Utensils, Package, Users, ShoppingCart,
  Bell, ChevronDown, Menu, X, Brain, Monitor, LogOut, ContactRound,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useBranches } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseEnabled } from '@/lib/supabase';
import type { Role } from '@/types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

const roleMenus: Record<Role, { label: string; icon: React.ElementType; path: string }[]> = {
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'CRM', icon: ContactRound, path: '/crm' },
    { label: 'POS Terminal', icon: Monitor, path: '/pos' },
    { label: 'Operations', icon: Utensils, path: '/operations' },
    { label: 'Kitchen Display', icon: ChefHat, path: '/kds' },
    { label: 'Inventory', icon: Package, path: '/inventory' },
    { label: 'HR & Rostering', icon: Users, path: '/rostering' },
  ],
  MANAGER: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'CRM', icon: ContactRound, path: '/crm' },
    { label: 'POS Terminal', icon: Monitor, path: '/pos' },
    { label: 'Operations', icon: Utensils, path: '/operations' },
    { label: 'Kitchen Display', icon: ChefHat, path: '/kds' },
    { label: 'Inventory', icon: Package, path: '/inventory' },
    { label: 'HR & Rostering', icon: Users, path: '/rostering' },
  ],
  KITCHEN: [
    { label: 'Kitchen Display', icon: ChefHat, path: '/kds' },
  ],
  CUSTOMER: [
    { label: 'Order', icon: ShoppingCart, path: '/customer' },
  ],
};

const roleLabels: Record<Role, string> = {
  ADMIN: 'Corporate Admin',
  MANAGER: 'Branch Manager',
  KITCHEN: 'Kitchen Staff',
  CUSTOMER: 'Customer',
};

interface LayoutProps {
  children: React.ReactNode;
}

const RoleBasedLayout = ({ children }: LayoutProps) => {
  const branches = useBranches();
  const { currentRole, setRole, selectedBranch, setBranch, notifications, markNotificationRead, cart } = useAppStore();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuItems = roleMenus[currentRole];
  const unreadCount = notifications.filter(n => !n.read).length;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  // Flow 8: Check User Permissions – sync role from user_profiles when Supabase Auth is enabled
  useEffect(() => {
    if (!isSupabaseEnabled || !profile?.role) return;
    const r = profile.role.toUpperCase();
    if (r === 'ADMIN' || r === 'MANAGER' || r === 'KITCHEN' || r === 'CUSTOMER') {
      setRole(r as Role);
    }
  }, [profile?.role, setRole]);

  // Customer gets a different layout
  if (currentRole === 'CUSTOMER' || location.pathname === '/customer') {
    return <>{children}</>;
  }

  const handleRoleChange = (role: Role) => {
    setRole(role);
    // Navigate to the first available route for the new role
    const firstRoute = roleMenus[role][0]?.path || '/';
    navigate(firstRoute);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Nav */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-50">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent menuItems={menuItems} currentPath={location.pathname} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Brain className="w-6 h-6 text-primary" />
          <span className="hidden sm:inline">MH <span className="text-primary">Cognition</span></span>
        </Link>

        {/* Branch Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-4 gap-1 text-xs">
              {branches.find(b => b.id === selectedBranch)?.name}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {branches.map(b => (
              <DropdownMenuItem key={b.id} onClick={() => setBranch(b.id)}>
                {b.name}
                <Badge variant={b.performanceScore > 80 ? 'default' : 'destructive'} className="ml-2 text-[10px]">
                  {b.performanceScore}%
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              {roleLabels[currentRole]}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(roleLabels) as Role[]).map(role => (
              <DropdownMenuItem key={role} onClick={() => handleRoleChange(role)}>
                {roleLabels[role]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b font-semibold text-sm">Notifications</div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 border-b text-sm cursor-pointer hover:bg-accent/50 ${!n.read ? 'bg-accent/20' : ''}`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={n.type === 'alert' ? 'destructive' : n.type === 'warning' ? 'outline' : 'default'} className="text-[10px]">
                      {n.type}
                    </Badge>
                    <span className="font-medium">{n.title}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User / Sign out (Flow 8: End Session) */}
        {isSupabaseEnabled && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 bg-primary/20 text-primary text-xs font-bold">
                {(user.email?.[0] ?? 'U').toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => { void signOut().then(() => navigate('/login')); }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : isSupabaseEnabled ? (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            MH
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-56 border-r border-border bg-card/50 flex-col py-4">
          <SidebarContent menuItems={menuItems} currentPath={location.pathname} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function SidebarContent({ menuItems, currentPath, onNavigate }: {
  menuItems: { label: string; icon: React.ElementType; path: string }[];
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      <AnimatePresence mode="wait">
        {menuItems.map((item, i) => {
          const active = currentPath === item.path;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}

export default RoleBasedLayout;
