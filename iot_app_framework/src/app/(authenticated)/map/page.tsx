import dynamic from 'next/dynamic';

import Loading from '@components/widgets/loading';

const MapPage = dynamic(
    () => import('./map-page'),
    {
        loading: () => <Loading fullscreen />
    }
);

const Page = async () => {
    return (
        <MapPage />
    );
};

export default Page;
