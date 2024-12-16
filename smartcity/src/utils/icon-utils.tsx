import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constants.
const FA_PREFIX = "fa-";
const FA_LIB_REGULAR = "regular";
const FA_LIB_REGULAR_PREFIX = "far";
const FA_LIB_SOLID = "solid";
const FA_LIB_SOLID_PREFIX = "fas";

// Helper function to resolve icon dynamically
export const resolveIcon = (faIconString: string | undefined): [string, string] | null => {
    if (!faIconString) return null;

    let [prefix, iconName] = faIconString.split(" ");

    prefix = prefix.replace(FA_PREFIX, "");
    if (prefix === FA_LIB_REGULAR) {
        prefix = FA_LIB_REGULAR_PREFIX;
    } else if (prefix === FA_LIB_SOLID) {
        prefix = FA_LIB_SOLID_PREFIX;
    } else {
        return null;
    }

    if (prefix && iconName) {
        return [prefix, iconName.replace(FA_PREFIX, "")];
    }
    
    return null;
};

/**
 * Returns the table sort icon corresponding to the given sort direction.
 * 
 * @param sortDir Sort direction.
 * 
 * @returns The table sort icon.
 */
export const getTableSortIcon = (sortDir: boolean) => {
    return (<FontAwesomeIcon icon={sortDir ? faAngleUp : faAngleDown} fixedWidth />);
};
