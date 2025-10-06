'use-client';

import React from 'react';
import { Input, InputGroup, InputGroupText } from 'reactstrap';

import IconButton from '@components/widgets/icon-button';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

interface Props {
    id?: string;
    name?: string;
    prepend?: JSX.Element;
    type?: string;
    className?: string;
    placeholder?: string;
    autoComplete?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
}

function PasswordInput(props: Props) : JSX.Element {
    const { id = 'password', name = 'password', prepend, className, value = '', ...rest } = props;
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <InputGroup>
            { prepend
                && (
                    <InputGroupText>
                        { prepend }
                    </InputGroupText>
                )}
            <Input
                {...rest}
                id={id}
                name={name}
                type={showPassword ? 'text' : 'password'}
                value={value} // Ensures the value is always controlled
                className={className} // Apply `className` here
                style={{ paddingRight: '35px', zIndex: 0 }}
            />
            <IconButton
                title={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                style={{ right: '10px', position: 'absolute', top: '12px', zIndex: 1 }}
            />
        </InputGroup>

    );
}

export default PasswordInput;
