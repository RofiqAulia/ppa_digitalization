import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import RefrezingDashboard from './Components/RefrezingDashboard';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard Refrezing" />
            <RefrezingDashboard />
        </AppLayout>
    );
}
