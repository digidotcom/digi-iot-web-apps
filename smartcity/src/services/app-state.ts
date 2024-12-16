import Freezer from 'freezer-js';

export const initialState = {
    layout: {
        sidebarCollapsed: false,
        sidebarVisible: true,
        smallView: false
    },
};

const AppState = new Freezer(initialState);

export default AppState;
