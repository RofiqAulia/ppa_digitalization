import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import IqfDashboard from './Components/IqfDashboard';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard IQF" />
            <IqfDashboard />
        </AppLayout>
    );
}
