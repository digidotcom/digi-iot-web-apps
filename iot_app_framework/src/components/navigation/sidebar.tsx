'use-client';

import _ from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { BASE_PATH } from '@configs/app-config';
import { CSidebar } from '@coreui/react';
import { faCompass, faGaugeHigh, faGears } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appState from '@services/app-state';

const Sidebar = () => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);
    const [visible, setVisible] = React.useState(true);

    const handleSidebarCollapsed = React.useCallback((layout: any) => {
        if (collapsed !== layout.sidebarCollapsed) {
            setCollapsed(layout.sidebarCollapsed);
        }
        if (visible !== layout.sidebarVisible) {
            setVisible(layout.sidebarVisible);
        }
    }, [collapsed, visible]);

    React.useEffect(() => {
        appState.get().layout.getListener().on('update', handleSidebarCollapsed);
        const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
        appState.get().layout.set({ sidebarCollapsed: collapsed });
        return () => appState.get().layout.getListener().off('update', handleSidebarCollapsed);
    }, [handleSidebarCollapsed]);

    const linkClicked = () => {
        const { layout } = appState.get();
        if (layout.smallView) {
            appState.get().layout.set({ sidebarVisible: false });
            setVisible(false);
        }
    };

    // Adjust path to exclude base path if present
    const adjustedPathname = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
    const path = adjustedPathname.split('/');
    const currentNav = path[1];

    const navConfig = React.useMemo(() => {
        return (
            <div className="sidebar-nav">
                <div className="mt-1" />
                <Link prefetch href="/dashboard" className={`nav-link js-dashboard-nav ${_.startsWith('/dashboard', currentNav, 1) ? 'active' : ''}`} onClick={linkClicked}>
                    <FontAwesomeIcon icon={faGaugeHigh} className="nav-icon" />
                    Dashboard
                </Link>
                <Link prefetch href="/location" className={`nav-link js-location-nav ${_.startsWith('/location', currentNav, 1) ? 'active' : ''}`} onClick={linkClicked}>
                    <FontAwesomeIcon icon={faCompass} className="nav-icon" />
                    Location
                </Link>
                <Link prefetch href="/management" className={`nav-link js-management-nav ${_.startsWith('/management', currentNav, 1) ? 'active' : ''}`} onClick={linkClicked}>
                    <FontAwesomeIcon icon={faGears} className="nav-icon" />
                    Management
                </Link>
            </div>
        );
    }, [currentNav]);

    return (
        <CSidebar className={visible ? "main-sidebar show" : "main-sidebar"} position="fixed" narrow={collapsed}>
            {navConfig}
        </CSidebar>
    );
};

export default Sidebar;
