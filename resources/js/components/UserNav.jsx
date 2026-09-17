import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';

export function UserNav() {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'Admin', email: '' };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'koordinator' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                                {user.role === 'admin' ? 'Admin' : user.role === 'koordinator' ? 'Koordinator' : 'Operator'}
                            </span>
                        </div>
                        {user.email && (
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/users" className="w-full cursor-pointer">
                                    Manajemen User
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem asChild>
                    <Link href={route('logout')} method="post" as="button" className="w-full cursor-pointer text-left">
                        Log out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
