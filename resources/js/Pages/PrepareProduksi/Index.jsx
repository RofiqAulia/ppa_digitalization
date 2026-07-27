import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Edit } from 'lucide-react';

export default function Index({ headers }) {
    return (
        <AppLayout>
            <Head title="Prepare Produksi" />
            
            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prepare Produksi</h2>
                    <p className="text-muted-foreground">
                        Kelola data rencana dan realisasi produksi.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/prepare-produksi/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Plan Baru
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Prepare Produksi</CardTitle>
                    <CardDescription>Semua data rencana produksi yang telah diinput.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Plan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {headers && headers.length > 0 ? (
                                headers.map((header) => (
                                    <TableRow key={header.id}>
                                        <TableCell className="font-medium">{header.date}</TableCell>
                                        <TableCell>Shift {header.shift}</TableCell>
                                        <TableCell>{header.spv_name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${header.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {header.status === 'completed' ? 'Selesai' : 'Planned'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{header.total_recipe_plan} recipe</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/prepare-produksi/${header.id}`}>
                                                <Button variant="outline" size="icon" title="Detail">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {header.status !== 'completed' && (
                                                <Link href={`/prepare-produksi/${header.id}/edit`}>
                                                    <Button variant="outline" size="icon" title="Input Realisasi">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Belum ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
