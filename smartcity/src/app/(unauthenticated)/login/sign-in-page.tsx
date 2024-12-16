'use client';

import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { Card, CardBody, CardGroup, Col, Container, Row } from 'reactstrap';

import LoginPanel from '@components/login/login-panel';
import Loading from '@components/widgets/loading';
import { checkAlertDefinitions } from '@services/drm/alert-definitions';

/**
 * Prevent infinite redirect loop.
 *
 * @param url The requested URL to redirect to once authenticated.
 * @returns The actual URL to redirect to once authenticated.
 */
const sanitizeCallback = (url: string | null) => {
    if (!url || url === '/' || url === '/login' || url === '/logout') {
        return '/dashboard';
    }
    return url;
};

const SignIn = () => {
    const search = useSearchParams();
    const error = search.get('error') || undefined;
    const { status } = useSession();
    const router = useRouter();
    const callbackUrl = sanitizeCallback(search.get('callbackUrl'));
    const authenticated = useRef(false);

    useEffect(() => {
        const initializeResources = async () => {
            await checkAlertDefinitions(); // Call any initialization logic here
        };

        if (status === 'authenticated' && !authenticated.current) {
            authenticated.current = true;
            initializeResources().then(() => {
                if (!callbackUrl.includes('/login')) {
                    setTimeout(() => router.push(callbackUrl), 1000);
                }
            });
        }
    }, [status, callbackUrl, router]);

    if (status === 'loading') {
        return <Loading fullscreen text="Checking login status..." />;
    }

    if (status === 'authenticated') {
        return <Loading fullscreen text="Authenticated, redirecting..." />;
    }

    return (
        <div className="login">
            <div className={classNames('js-login-body login-body flex-row flex-fill align-items-center')}>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg="5">
                            <CardGroup className="flex-column flex-md-row">
                                <Card className="p-4 overflow-hidden">
                                    <CardBody className="login-body-card-body position-relative">
                                        <LoginPanel error={error || undefined} />
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default SignIn;