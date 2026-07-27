import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Placeholder({ title }) {
    return (
        <AppLayout>
            <Head title={title} />
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Fitur Dalam Tahap Migrasi</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Halaman ini sedang dalam proses pemindahan ke React + Shadcn UI.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
