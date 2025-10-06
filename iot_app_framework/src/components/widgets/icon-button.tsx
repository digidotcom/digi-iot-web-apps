import { CSSProperties, SyntheticEvent } from 'react';

import { ColorStyles } from '@configs/style-constants';
import { IconDefinition, IconName, IconPrefix, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { resolveIcon } from '@utils/icon-utils';

// Constants.
const DEFAULT_COLOR = ColorStyles.darkGray;
const DEFAULT_ICON: [IconPrefix, IconName] = ["fas", "square-check"];

// Register all icon packs for dynamic usage.
library.add(fas, far);

// Interface to exchange data using props.
interface Props {
    id?: string;
    icon: IconDefinition | string;
    color?: string;
    size?: SizeProp | string;
    title?: string;
    onClick?: (e?: SyntheticEvent) => void;
    enabled?: boolean;
    hidden?: boolean;
    spin?: boolean;
    style?: CSSProperties;
}

// Component definition.
const IconButton = (props: Props) => {
    const {
        id,
        icon,
        color = DEFAULT_COLOR,
        size,
        title = "",
        onClick,
        enabled = true,
        hidden = false,
        spin = false,
        style = {}
    } = props;

    // Resolve the icon value based on the given property.
    let resolvedIcon: IconDefinition | [IconPrefix, IconName] | null =
        typeof icon === 'string'
        ? resolveIcon(icon) as [IconPrefix, IconName]
        : icon;

    // Determine if the size is a FontAwesome predefined size or a custom size like "18px".
    const isCustomSize = typeof size === 'string' && !["xs", "sm", "lg", "xl", "2xl", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"].includes(size);

    // Dummy method called when the button is clicked but it is disabled to avoid propagating the click event.
    const dummyClick = (e?: SyntheticEvent) => {
        e?.stopPropagation();
    };

    const defaultStyle: CSSProperties = { color: color, fontSize: isCustomSize ? size : undefined, display: hidden ? "none" : "unset" };

    return (
        <FontAwesomeIcon
            id={id}
            icon={resolvedIcon != null ? resolvedIcon : DEFAULT_ICON}
            size={!isCustomSize ? size as SizeProp : undefined}
            onClick={enabled ? onClick : dummyClick}
            title={title}
            style={{...defaultStyle, ...style}}
            className={`icon-button ${enabled ? 'enabled' : 'disabled'}`}
            spin={spin}
            fixedWidth
        />
    );
};

export default IconButton;