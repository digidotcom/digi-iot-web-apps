import dynamic from 'next/dynamic';

import Loading from '@components/widgets/loading';

const LocationPage = dynamic(
    () => import('./location-page'),
    {
        loading: () => <Loading fullscreen />,
        ssr: false,
    }
);

const Page = async () => {
    return (
        <LocationPage />
    );
};

export default Page;
