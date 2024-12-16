import CopyableDataSpan from '@components/widgets/copyable-data-span';
import { faBus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Bus } from '@models/Bus';

// Interface to exchange data using props.
interface Props {
    bus: Bus
}

// Component definition.
const BusInfoHeader = (props: Props) => {
    // Initialize variables from props.
    const { bus } = props;

    return (
        <div className="bus-info-header-container">
            <div className="bus-info-header-icon-container">
                <FontAwesomeIcon
                    icon={faBus}
                    fixedWidth
                    size="2x"
                    color={bus.line?.color || "" }
                />
            </div>
            <div className="bus-info-header-value-container">
                <div className="bus-info-header-value">
                    <span className="name">{bus.name}</span>
                </div>
                <div className="bus-info-header-value">
                    <span className="line">{bus.line?.name ?? "No line assigned"}</span>
                </div>
                <div className="bus-info-header-value-spacer"></div>
                <div className="bus-info-header-value">
                    <CopyableDataSpan
                        className="bus-info-header-value-id"
                        data={bus.id.split("-").slice(2, 4).join("-")}
                        dataToCopy={bus.id} />
                </div>
            </div>
        </div>
    );
};

export default BusInfoHeader;