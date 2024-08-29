/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface CrossDomainOptions {
    permittedPolicies?: string;
}
declare const _default: (options?: CrossDomainOptions) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
