import React, { useState } from 'react';
import { Sidebar } from '@/Components/Sidebar';
import { TopNav } from '@/Components/TopNav';

export default function AppLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f0f4f9] text-slate-800 font-sans antialiased">
            {/* Top Navigation Bar */}
            <TopNav 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setSidebarCollapsed}
            />
            
            {/* Content Body with Padded Floating Sidebar & Main */}
            <div className="flex flex-1 overflow-hidden p-3 gap-3">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setSidebarOpen} 
                    isCollapsed={isSidebarCollapsed} 
                    setIsCollapsed={setSidebarCollapsed} 
                />
                
                <main className="flex-1 overflow-y-auto custom-scrollbar rounded-3xl bg-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
}
