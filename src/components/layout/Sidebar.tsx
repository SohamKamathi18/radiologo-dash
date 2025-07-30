import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ScanLine, 
  LogOut,
  Stethoscope,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'doctor', 'analyst']
  },
  {
    title: 'Patients',
    url: '/patients',
    icon: Users,
    roles: ['admin', 'doctor', 'analyst']
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: FileText,
    roles: ['admin', 'doctor']
  },
  {
    title: 'X-Ray Analysis',
    url: '/xray',
    icon: ScanLine,
    roles: ['admin', 'doctor', 'analyst']
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigationItems.some((item) => isActive(item.url));
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary border-primary/30 shadow-glow" 
      : "hover:bg-secondary/50 hover:text-primary transition-medical";

  const filteredItems = navigationItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} bg-card border-border transition-medical`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-3 self-end text-primary hover:bg-primary/10" />

      <SidebarContent className="px-3">
        {/* Medical Brand */}
        <div className="mb-6 flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-medical">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">MediScan</h1>
              <p className="text-xs text-muted-foreground">AI Radiology</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            {collapsed ? "" : "Medical Workspace"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavClassName({ isActive: isActive(item.url) })} 
                        flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile & Logout */}
        <div className="mt-auto mb-4 space-y-4">
          {!collapsed && user && (
            <div className="px-3 py-2 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={logout}
            variant="outline"
            size={collapsed ? "icon" : "sm"}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-medical"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}