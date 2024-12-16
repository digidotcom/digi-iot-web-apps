'use-client';

import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from "react";

import { BASE_PATH } from '@configs/app-config';
import { CHeader, CHeaderToggler } from '@coreui/react';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appState from '@services/app-state';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

const TopBar = () => {
    const [userDropdown, setUserDropdown] = React.useState(false);
    const { status: sessionStatus } = useSession();

    const toggleSidebar = React.useCallback(() => {
        const { layout } = appState.get();
        if (!layout.smallView) {
            const collapsed = !layout.sidebarCollapsed;
            layout.set({ sidebarCollapsed: collapsed });
            localStorage.setItem("sidebarCollapsed", collapsed.toString());
        } else {
            const visible = !layout.sidebarVisible;
            layout.set({ sidebarVisible: visible });
        }
    }, []);

    return (
        <CHeader className={classNames('header-fixed', 'd-flex', 'justify-content-between', 'align-items-center')}>
            {sessionStatus === 'authenticated' && (
                <>
                    <CHeaderToggler
                        className="d-lg-none"
                        onClick={toggleSidebar}
                    />
                    <CHeaderToggler
                        className="d-none d-lg-block"
                        onClick={toggleSidebar}
                    />
                </>
            )}
            <div className="header-logo ms-2 flex-grow-1 d-flex justify-content-center">
                <div className="sidebar-brand-minimized digi-logo">
                    <Image
                        src={`${BASE_PATH}/images/logo.png`}
                        alt="Logo"
                        height={31}
                        width={101}
                    />
                </div>
            </div>
            {sessionStatus === 'authenticated' && (
                <div>
                    <Dropdown direction="down" className="me-4 d-flex" isOpen={userDropdown} toggle={() => { setUserDropdown(!userDropdown) }}>
                        <DropdownToggle className="m-auto py-2 toolbar-btn">
                            <FontAwesomeIcon icon={faUserCircle} size="2x" />
                        </DropdownToggle>
                        <DropdownMenu end className="header-dropdown-menu">
                            <Link href="/logout">
                                <DropdownItem className="js-logout-menu">
                                    Log out
                                </DropdownItem>
                            </Link>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            )}
        </CHeader>
    );
};

export default TopBar;