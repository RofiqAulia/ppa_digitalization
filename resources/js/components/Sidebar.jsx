import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FileText, Menu, X, ChevronLeft, ChevronRight, ChevronDown,
    Layers, ClipboardList, Factory, Snowflake, Package, History, Users, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const navigation = [
    { name: 'IQF', isTitle: true },
    { name: 'Dashboard',       href: '/iqf-logsheet/dashboard', icon: LayoutDashboard },
    { name: 'Logsheet Harian', href: '/logsheet-iqf',           icon: FileText },
    { name: 'History',         href: '/iqf-logsheet/history',   icon: History },

    { name: 'Manajemen User', isTitle: true },
    { name: 'Add User',        href: '/admin/users',            icon: Users },
    { name: 'Log out',         href: '/logout',                 icon: LogOut, method: 'post' },
];

function NavItem({ item, isCollapsed, setIsCollapsed, url }) {
    // Check if current URL matches item or any children
    const isActive = !item.disabled && (
        (url.startsWith(item.href) && item.href !== '#') ||
        (item.children && item.children.some(child => url.startsWith(child.href)))
    );

    const [isOpen, setIsOpen] = useState(isActive);

    const handleClick = () => {
        if (item.disabled) return;
        if (isCollapsed && setIsCollapsed) {
            setIsCollapsed(false);
            setIsOpen(true);
        } else {
            setIsOpen(!isOpen);
        }
    };

    // Render section title
    if (item.isTitle) {
        if (isCollapsed) return <div className="my-4 border-t border-slate-200 w-6 mx-auto"></div>;
        return (
            <div className="px-4 py-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item.name}
            </div>
        );
    }

    // Disabled item — non-clickable, muted
    if (item.disabled) {
        return (
            <div className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium select-none",
                isCollapsed ? "justify-center" : "gap-3",
                "opacity-40 cursor-not-allowed"
            )}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                    <span className="flex items-center gap-2">
                        {item.name}
                        <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-500 rounded px-1 py-0.5 leading-none">Segera</span>
                    </span>
                )}
            </div>
        );
    }

    if (item.children) {
        return (
            <div className="space-y-1">
                <div
                    onClick={handleClick}
                    className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                        isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
                    )}
                </div>
                {!isCollapsed && isOpen && (
                    <div className="ml-9 space-y-1 mt-1 border-l border-slate-200 pl-2 py-1">
                        {item.children.map(child => {
                            const isChildActive = url === child.href || url.startsWith(child.href);
                            return (
                                <Link key={child.name} href={child.href}>
                                    <div className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                                        isChildActive ? "bg-secondary/60 text-secondary-foreground font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}>
                                        {child.icon && <child.icon className="h-4 w-4 shrink-0" />}
                                        <span>{child.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href={item.href} method={item.method || 'get'} as={item.method ? 'button' : 'a'} className={item.method ? 'w-full block' : ''}>
            <div className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed ? "justify-center" : "gap-3"
            )}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
            </div>
        </Link>
    );
}

function SidebarContent({ isCollapsed, setIsCollapsed }) {
    const { url } = usePage();
    return (
        <div className="flex flex-col h-full bg-card border-r shadow-sm">
            <div className={cn("flex items-center h-16 border-b px-4", isCollapsed ? "justify-center" : "justify-start")}>
                <div className="flex items-center gap-2 font-bold tracking-tight text-primary">
                    <div className="flex items-center shrink-0 gap-1.5">
                        <img src="/images/ppa.jpg" alt="PPA" className="h-8 w-auto rounded" />
                        <img src="/images/LogoMieGacoan.png" alt="Gacoan" className="h-8 w-auto object-contain" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-[13px] leading-tight text-slate-700">
                            Digitalization of <br /> Production Division
                        </span>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {navigation.map((item) => (
                        <NavItem
                            key={item.name}
                            item={item}
                            isCollapsed={isCollapsed}
                            setIsCollapsed={setIsCollapsed}
                            url={url}
                        />
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
}

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:block h-full transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-[80px]" : "w-64"
            )}>
                <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -right-4 top-20 rounded-full h-8 w-8 shadow-md border z-10"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent isCollapsed={false} setIsCollapsed={undefined} />
                </SheetContent>
            </Sheet>
        </>
    );
}
