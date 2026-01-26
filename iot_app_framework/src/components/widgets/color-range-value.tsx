// Interface to exchange data using props.
interface Props {
    value: number | undefined;
    upperThreshold: number;
    lowerThreshold: number;
    units?: string;
    lowerIsBetter?: boolean;
}

// Component definition.
const ColorRangeValue = (props: Props) => {
    // Retrieve variables.
    const { value, upperThreshold, lowerThreshold, units, lowerIsBetter = false } = props;

    /**
     * Returns the class name corresponding to the provided value based on thresholds.
     * 
     * @returns The class name corresponding to the provided value based on thresholds.
     */
    const getClass = () => {
        let className = "value-field-colored";
        if (value == undefined) {
            return className;
        }

        if (lowerIsBetter) {
            if (value <= upperThreshold) {
                className += " value-field-colored-good";
            } else if (value <= lowerThreshold) {
                className += " value-field-colored-normal";
            } else {
                className += " value-field-colored-bad";
            }
        } else {
            if (value >= upperThreshold) {
                className += " value-field-colored-good";
            } else if (value >= lowerThreshold) {
                className += " value-field-colored-normal";
            } else {
                className += " value-field-colored-bad";
            }
        }

        return className;
    };

    return (
        <div className={getClass()}>
            {Number.isFinite(value) ? `${value?.toFixed(2)} ${units ?? ""}`  : "-"}
        </div>
    );
};

export default ColorRangeValue;