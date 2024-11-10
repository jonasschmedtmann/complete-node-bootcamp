/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface XXssProtectionOptions {
    mode?: 'block' | null;
    reportUri?: string;
    setOnOldIE?: boolean;
}
declare const _default: (options?: XXssProtectionOptions) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
