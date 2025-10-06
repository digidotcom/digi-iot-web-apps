'use-client';

import { signIn } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Input, InputGroup, InputGroupText, Row } from 'reactstrap';
import { useSWRConfig } from 'swr';

import PasswordInput from '@components/login/user-password';
import { faCircleNotch, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    error?: string;
}

const LoginPanel = ({ error }: Props): React.ReactElement => {
    const [username, setUsername] = React.useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const [password, setPassword] = useState<string | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error);
    const [capsOn, setCapsOn] = useState(false);
    const { mutate, cache } = useSWRConfig();

    const checkCaps = (event: globalThis.KeyboardEvent) => {
        if (event.key === 'CapsLock') {
            setCapsOn(event.getModifierState('CapsLock'));
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', checkCaps);
        document.addEventListener('keyup', checkCaps);
        return () => {
            document.removeEventListener('keydown', checkCaps);
            document.removeEventListener('keyup', checkCaps);
        };
    }, []);

    const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = e;
        e.preventDefault();
        setUsername(value);
    };

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = e;
        e.preventDefault();
        setPassword(value);
        setLocalError(undefined);
    };

    const onSubmitLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
        await Promise.all([...cache.keys()].map((key) => mutate(key, undefined, { revalidate: false })));
        e.preventDefault();
        if (password) {
            setLocalError(undefined);
            setLoggingIn(true);
            const result = await signIn('credentials', { username, password, redirect: false });
            setLocalError(result?.error || undefined);
            setLoggingIn(false);
        }
    };

    return (
        <Form action="none" onSubmit={onSubmitLogin} className="position-absolute username-card-body js-username-panel login-panel-content">
            <h1>Digi IoT Application Framework</h1>
            {localError && <Alert color="danger">{localError}</Alert>}
            {loggingIn
                ? (
                    <p className="muted-text">
                        <FontAwesomeIcon icon={faCircleNotch} spin /> Logging in...
                    </p>
                )
                : <p className="muted-text">Enter your Digi Remote Manager username and password.</p>}
            <InputGroup className="mb-3">
                <InputGroupText>
                    <FontAwesomeIcon icon={faUser} />
                </InputGroupText>
                <Input
                    type="text"
                    name="username"
                    className="js-username"
                    defaultValue={username}
                    placeholder="Username"
                    autoComplete="username"
                    onChange={onChangeUsername}
                    autoFocus
                />
            </InputGroup>
            <InputGroup className="mb-4">
                <PasswordInput
                    prepend={<FontAwesomeIcon icon={faLock} />}
                    type="password"
                    name="password"
                    className="js-password"
                    value={password}
                    placeholder="Password"
                    autoComplete="current-password"
                    onChange={onChangePassword}
                />
            </InputGroup>
            <p className={capsOn ? 'd-block text-danger js-capslock-warning' : 'd-none'}>
                Warning: Caps lock is on.
            </p>
            <Row>
                <Col xs="6">
                    <Button
                        type="submit"
                        color="primary"
                        className="px-4 me-2 js-login-button"
                        disabled={loggingIn || !username || !password || username.length == 0 || password.length == 0}
                    >
                        {loggingIn ? 'Logging in...' : 'Log in'}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default LoginPanel;
