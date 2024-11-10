/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { CspOptions } from './lib/types';
declare const _default: (options: CspOptions) => (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
