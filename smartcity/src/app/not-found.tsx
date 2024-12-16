'use client';

import classNames from 'classnames';
import Link from 'next/link';

const NotFound = () => (
    <div className={classNames('c-wrapper', 'flex flex-fill align-items-center justify-content-center')}>
        <h2>Not Found</h2>
        <p>Could not find requested resource</p>
        <Link href="/dashboard">Main page</Link>
    </div>
);

export default NotFound;
