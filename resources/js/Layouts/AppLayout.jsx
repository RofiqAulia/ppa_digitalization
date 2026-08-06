import React, { useState } from 'react';
import { Sidebar } from '@/Components/Sidebar';
import { TopNav } from '@/Components/TopNav';

export default function AppLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 bg-background">
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setSidebarOpen} 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setSidebarCollapsed} 
            />
            
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNav 
                    isSidebarOpen={isSidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setSidebarCollapsed}
                />
                
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
