/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface HidePoweredByOptions {
    setTo?: string;
}
declare const _default: (options?: HidePoweredByOptions | undefined) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
