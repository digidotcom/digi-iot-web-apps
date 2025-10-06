import dynamic from 'next/dynamic';

import Loading from '@components/widgets/loading';

const ManagementPage = dynamic(
    () => import('./management-page'),
    {
        loading: () => <Loading fullscreen />,
        ssr: false,
    }
);

const Page = () => (
    <ManagementPage />
);

export default Page;
