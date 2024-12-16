import dynamic from 'next/dynamic';

import Loading from '@components/widgets/loading';

const SignIn = dynamic(
    () => import('./sign-in-page'),
    {
        loading: () => <Loading fullscreen />,
        ssr: false,
    }
);

const Page = () => (
    <SignIn />
);

export default Page;
