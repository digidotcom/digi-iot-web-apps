'use client';

import dynamic from 'next/dynamic';

import Loading from '@components/widgets/loading';
import { BusesProvider } from '@contexts/buses-provider';

const DashboardPage = dynamic(
    () => import('./dashboard-page'),
    {
        loading: () => <Loading fullscreen />,
        ssr: false,
    }
);

const Page = () => (
    <BusesProvider>
        <DashboardPage />
    </BusesProvider>
);

export default Page;
