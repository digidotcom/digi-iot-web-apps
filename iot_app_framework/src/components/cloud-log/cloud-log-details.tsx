'use client';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-xcode";

import IconButton from '@components/widgets/icon-button';
import { CloudLogItem } from '@customTypes/cloud-log-types';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown, faReply, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useResizeObserver } from '@utils/react-utils';
import { copyToClipboard } from "@utils/utils";
import React from 'react';
import { Card, CardTitle, Input, InputGroup, InputGroupText } from 'reactstrap';
import xmlFormat from 'xml-formatter';

// Default editor configuration.
const EDITOR_PROPS = {
    theme: "xcode",
    width: "100%",
    height: "100%",
    showPrintMargin: false,
    highlightActiveLine: false,
    readOnly: true,
    wrapEnabled: true,
    setOptions: {
        useWorker: false
    }
};

// Props interface.
interface Props {
    selectedItem?: CloudLogItem;
    tableExpanded: boolean;
    setTableExpanded: (expanded: boolean) => void;
}

const CloudLogDetails = (props: Props) => {
    const { selectedItem, tableExpanded, setTableExpanded } = props;

    // References to the request and response code editors.
    const reqBodyRef = React.useRef<AceEditor>(null);
    const respBodyRef = React.useRef<AceEditor>(null);

    const [containerHeight, setContainerHeight] = React.useState(0);

    // Calculates the height this pane should have based on the container pane height.
    const detailsHeight = React.useMemo(() => {
        const body = document.getElementById("offcanvas-body");
        if (body) {
            return body.clientHeight - 10;
        }
        return 400;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerHeight]);

    // Calculates the height the request/response body panes should have based on the details page height.
    const bodyHeight = React.useMemo(() => {
        let nEditors = 0;
        if (selectedItem?.requestBody)
            nEditors += 1;
        if (selectedItem?.responseBody)
            nEditors += 1;
        return (detailsHeight - 40 - (10 * nEditors)) / nEditors;
    }, [detailsHeight, selectedItem]);

    // Store the container height when it changes.
    useResizeObserver("offcanvas-body", (width, height) => {
        setContainerHeight(height);
    });

    /**
     * Returns the code editor mode based on the given content type.
     * 
     * @param type Content type.
     * 
     * @returns The code editor mode.
     */
    const getEditorMode = (type?: string) => {
        if (type) {
            if (type.includes("xml")) {
                return "xml";
            } else if (type.includes("json")) {
                return "json";
            } else if (type.includes("application/octet-stream")) {
                return "stream";
            }
        }
        return "text";
    };

    /**
     * Returns the code editor value in the correct format based on the given content type.
     * 
     * @param value Content value.
     * @param type Content type.
     * 
     * @returns The value in the correct format.
     */
    const getEditorValue = (value: string, type?: string) => {
        const mode = getEditorMode(type);
        switch (mode) {
            case "xml":
                return xmlFormat(value);
            case "json":
                return JSON.stringify(JSON.parse(value), null, 4);
            case "stream":
                // Do not return the content, it might be huge.
                return "Binary data";
            default:
                return value;
        }
    };

    return (
        <div className="cloud-log-details" style={{height: `${detailsHeight}px`}}>
            {/* Control with the full request. */}
            <div className="cloud-log-card">
                <InputGroup>
                    <InputGroupText hidden={tableExpanded}>
                        <IconButton icon={faChevronDown} title="Show table" onClick={() => setTableExpanded(true)} />
                    </InputGroupText>
                    <Input value={selectedItem?.fullUrl ?? ""} readOnly />
                    <InputGroupText>
                        <IconButton icon={faClipboard} title="Copy to clipboard" onClick={() => copyToClipboard(selectedItem?.fullUrl ?? "")} />
                    </InputGroupText>
                </InputGroup>
            </div>
            {/* Control with the request body (if any). */}
            {selectedItem?.requestBody && (
                <Card className="cloud-log-card" style={{height: `${bodyHeight}px`}}>
                    <CardTitle>
                        <FontAwesomeIcon icon={faShare} fixedWidth /> Request body
                        <div className="toolbar">
                            <IconButton icon={faClipboard} title="Copy to clipboard" onClick={() => copyToClipboard(reqBodyRef.current?.editor.getValue() ?? "")} />
                        </div>
                    </CardTitle>
                    <AceEditor
                        ref={reqBodyRef}
                        mode={getEditorMode(selectedItem.requestType)}
                        value={getEditorValue(selectedItem.requestBody, selectedItem.requestType)}
                        {...EDITOR_PROPS}
                    />
                </Card>
            )}
            {/* Control with the response body (if any). */}
            {selectedItem?.responseBody && (
                <Card className="cloud-log-card" style={{height: `${bodyHeight}px`}}>
                    <CardTitle>
                        <FontAwesomeIcon icon={faReply} fixedWidth /> Response body
                        <div className="toolbar">
                            <IconButton icon={faClipboard} title="Copy to clipboard" onClick={() => copyToClipboard(respBodyRef.current?.editor.getValue() ?? "")} />
                        </div>
                    </CardTitle>
                    <AceEditor
                        ref={respBodyRef}
                        mode={getEditorMode(selectedItem.responseType)}
                        value={getEditorValue(selectedItem.responseBody, selectedItem.responseType)}
                        {...EDITOR_PROPS}
                    />
                </Card>
            )}
        </div>
    );
};

export default CloudLogDetails;