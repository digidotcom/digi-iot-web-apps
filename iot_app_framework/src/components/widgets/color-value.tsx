const DEFAULT_BACKGROUD_COLOR = "#e0e0e0";
const DEFAULT_TEXT_COLOR = "#333333";

// Interface for value-color mapping.
export interface ColorMapping {
    value: string;
    backgroundColor: string;
    textColor?: string;
}

// Interface to exchange data using props.
interface Props {
    value: string | undefined;
    colorMappings: ColorMapping[];
    defaultBackgroundColor?: string;
    defaultTextColor?: string;
}

// Component definition.
const ColorValue = (props: Props) => {
    // Retrieve variables.
    const { value, colorMappings, defaultBackgroundColor = DEFAULT_TEXT_COLOR, defaultTextColor = DEFAULT_BACKGROUD_COLOR } = props;

    /**
     * Returns the inline styles corresponding to the provided value based on color mappings.
     * 
     * @returns The inline styles object.
     */
    const getStyles = () => {
        if (value == undefined) {
            return {
                backgroundColor: defaultBackgroundColor,
                color: defaultTextColor
            };
        }

        // Find matching color mapping
        const mapping = colorMappings.find(m => m.value === value);
        
        if (mapping) {
            return {
                backgroundColor: mapping.backgroundColor,
                color: mapping.textColor ?? '#ffffff'
            };
        }

        return {
            backgroundColor: defaultBackgroundColor,
            color: defaultTextColor
        };
    };

    return (
        <div className="value-field-colored" style={getStyles()}>
            {value ?? "-"}
        </div>
    );
};

export default ColorValue;