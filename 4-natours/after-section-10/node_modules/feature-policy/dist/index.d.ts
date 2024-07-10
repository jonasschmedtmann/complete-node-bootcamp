/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface FeaturePolicyOptions {
    features: {
        [featureName: string]: string[];
    };
}
declare const _default: (options: FeaturePolicyOptions) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
