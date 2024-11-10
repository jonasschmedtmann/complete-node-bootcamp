/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
declare type DirectiveType = string | ((req: IncomingMessage, res: ServerResponse) => string);
export declare type SourceListDirective = false | DirectiveType[];
export declare type PluginTypesDirective = false | DirectiveType[];
export declare type SandboxDirective = false | DirectiveType[];
export declare type ReportUriDirective = false | DirectiveType;
export declare type RequireSriForDirective = false | DirectiveType[];
export interface KebabCaseDirectives {
    'base-uri'?: SourceListDirective;
    'block-all-mixed-content'?: boolean;
    'child-src'?: SourceListDirective;
    'connect-src'?: SourceListDirective;
    'default-src'?: SourceListDirective;
    'font-src'?: SourceListDirective;
    'form-action'?: SourceListDirective;
    'frame-ancestors'?: SourceListDirective;
    'frame-src'?: SourceListDirective;
    'img-src'?: SourceListDirective;
    'manifest-src'?: SourceListDirective;
    'media-src'?: SourceListDirective;
    'object-src'?: SourceListDirective;
    'sandbox'?: SandboxDirective;
    'script-src'?: SourceListDirective;
    'style-src'?: SourceListDirective;
    'prefetch-src'?: SourceListDirective;
    'plugin-types'?: PluginTypesDirective;
    'report-to'?: ReportUriDirective;
    'report-uri'?: ReportUriDirective;
    'require-sri-for'?: RequireSriForDirective;
    'upgrade-insecure-requests'?: boolean;
    'worker-src'?: SourceListDirective;
}
export interface CamelCaseDirectives {
    baseUri?: SourceListDirective;
    blockAllMixedContent?: boolean;
    childSrc?: SourceListDirective;
    connectSrc?: SourceListDirective;
    defaultSrc?: SourceListDirective;
    fontSrc?: SourceListDirective;
    formAction?: SourceListDirective;
    frameAncestors?: SourceListDirective;
    frameSrc?: SourceListDirective;
    imgSrc?: SourceListDirective;
    manifestSrc?: SourceListDirective;
    mediaSrc?: SourceListDirective;
    objectSrc?: SourceListDirective;
    scriptSrc?: SourceListDirective;
    styleSrc?: SourceListDirective;
    prefetchSrc?: SourceListDirective;
    pluginTypes?: PluginTypesDirective;
    sandbox?: SandboxDirective;
    reportTo?: ReportUriDirective;
    reportUri?: ReportUriDirective;
    requireSriFor?: RequireSriForDirective;
    upgradeInsecureRequests?: boolean;
    workerSrc?: SourceListDirective;
}
export declare type AllDirectives = CamelCaseDirectives & KebabCaseDirectives;
export interface ParsedDirectives {
    [key: string]: string[] | string | boolean;
}
export interface CspOptions {
    browserSniff?: boolean;
    directives?: AllDirectives;
    disableAndroid?: boolean;
    loose?: boolean;
    reportOnly?: boolean | ((req: IncomingMessage, res: ServerResponse) => boolean);
    setAllHeaders?: boolean;
}
export {};
