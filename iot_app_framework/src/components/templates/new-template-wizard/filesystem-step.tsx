'use client';

import { SIZE_LEFT_COLUMN, SIZE_RIGHT_COLUMN } from '@components/templates/new-template-wizard/new-template-wizard';
import IconButton from '@components/widgets/icon-button';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import React, { Ref } from 'react';
import { Col, Form, FormGroup, FormText, Input, Label } from 'reactstrap';

// Interface with the methods exposed to the parent component.
export interface FilesystemStepRef {
    getFilesystem: () => File | undefined;
}

const FileSystemStep = React.forwardRef((props, ref: Ref<FilesystemStepRef>) => {
    // State values.
    const [filesystem, setFilesystem] = React.useState<File>();

    // Export the following function so that it can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        getFilesystem() {
            return filesystem;
        }
    }));

    return (
        <>
            <Form>
                <FormGroup row>
                    <Label for="filesystem" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The file system ZIP file" /> File System:
                        <br />
                        <span style={{marginLeft: "20px"}}>(optional)</span>
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="filesystem" type="file" accept=".zip" onChange={e => setFilesystem(e.target.files ? e.target.files[0] : undefined)} />
                        <FormText>The file system should be provided as a ZIP file. The contents of the file system will be deployed to the root folder of the underlying device.</FormText>
                    </Col>
                </FormGroup>
            </Form>
        </>
    );
});

FileSystemStep.displayName = "FileSystemStep";

export default FileSystemStep;