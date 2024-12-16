'use client';

import IconButton from '@components/widgets/icon-button';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { copyToClipboard } from '@utils/utils';
import React, { SyntheticEvent } from 'react';

// Properties interface.
interface Props {
    data: string;
    dataToCopy?: string;
    className?: string;
}

const CopyableDataSpan = (props: Props) => {
    const { data, dataToCopy, className } = props;

    // Used to show a button to copy the data to clipboard when the mouse is over the span.
    const [showCopyButton, setShowCopyButton] = React.useState(false);

    /**
     * Copies the data to the clipboard and stops propagating the event.
     *
     * @param e Event.
     */
    const onCopyToClipboardClicked = (e?: SyntheticEvent) => {
        copyToClipboard(dataToCopy ? dataToCopy : data);
        e?.stopPropagation();
    }

    return (
        <span title={dataToCopy ? dataToCopy : data} className={className} onMouseOver={() => setShowCopyButton(true)} onMouseOut={() => setShowCopyButton(false)}>
            {data} <IconButton icon={faClipboard} title="Copy to clipboard" onClick={onCopyToClipboardClicked} hidden={!showCopyButton} />
        </span>
    );
};

export default CopyableDataSpan;