import React from 'react';
import { CHeader, CHeaderNav, CNavItem, CHeaderToggler } from '@coreui/react';
import { Menu } from 'lucide-react';
import { UserNav } from './UserNav';
import { ThemeToggle } from './ThemeToggle';

export function TopNav({ setSidebarOpen }) {
    return (
        <CHeader position="sticky" className="mb-0 border-b bg-white px-4 md:px-6 shadow-sm z-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
                <CHeaderToggler
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-slate-600 hover:text-slate-900"
                >
                    <Menu className="h-5 w-5" />
                </CHeaderToggler>
            </div>

            <CHeaderNav className="ms-auto flex items-center gap-3">
                <CNavItem>
                    <ThemeToggle />
                </CNavItem>
                <CNavItem>
                    <UserNav />
                </CNavItem>
            </CHeaderNav>
        </CHeader>
    );
}
