// Constants.
const STATUS_IN_ROUTE = "In route";
const STATUS_OUT_OF_ROUTE = "Out of route";
const STATUS_MESSAGE_IN_ROUTE = "Bus is in route";
const STATUS_MESSAGE_OUT_OF_ROUTE = "Bus is out of route";
const STATUS_MESSAGE_IN_ROUTE_DISCONNECTED = "Bus was in route last time it was connected";
const STATUS_MESSAGE_OUT_OF_ROUTE_DISCONNECTED = "Bus was out of route last time it was connected";

// Interface to exchange data using props.
interface Props {
    inRoute: boolean;
    connected: boolean;
}

// Component definition.
const BusStatus = (props: Props) => {
    // Retrieve variables.
    const { inRoute, connected } = props;

    /**
     * Returns the class name corresponding to the provided bus status.
     * 
     * @returns The class name corresponding to the provided bus status.
     */
    const getClass = () => {
        let className = "bus-list-entry-field-status";
        if (connected) {
            className += inRoute ? " bus-list-entry-field-status-in-route" : " bus-list-entry-field-status-stopped";
        }
        return className;
    };

    /**
     * Returns the title corresponding to the provided bus status.
     * 
     * @returns The title corresponding to the provided bus status.
     */
    const getTitle = () => {
        if (connected) {
            return inRoute ? STATUS_MESSAGE_IN_ROUTE : STATUS_MESSAGE_OUT_OF_ROUTE;
        } else {
            return inRoute ? STATUS_MESSAGE_IN_ROUTE_DISCONNECTED : STATUS_MESSAGE_OUT_OF_ROUTE_DISCONNECTED;
        }
    };

    return (
        <div className={getClass()} title={getTitle()}>
            {inRoute ? STATUS_IN_ROUTE : STATUS_OUT_OF_ROUTE}
        </div>
    );
};

export default BusStatus;