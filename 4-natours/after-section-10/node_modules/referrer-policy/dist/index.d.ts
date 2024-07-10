/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface ReferrerPolicyOptions {
    policy?: string | string[];
}
declare const _default: (options?: ReferrerPolicyOptions | undefined) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
