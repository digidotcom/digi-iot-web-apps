import { Options as Xml2JsOptions } from 'xml2js';

export const XML2JS_OPTIONS: Xml2JsOptions = {
    explicitArray: false,
    attrNameProcessors: [(name) => `@${name}`],
    mergeAttrs: true,
    trim: true,
    async: false,
};