import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { ThemeToggle } from './ThemeToggle';

export function TopNav({ isSidebarOpen, setSidebarOpen }) {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm z-10">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
            
            <div className="w-full flex-1">
                {/* Breadcrumb could go here */}
            </div>
            
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    );
}
