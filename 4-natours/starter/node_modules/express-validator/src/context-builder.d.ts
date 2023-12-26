import { ContextItem } from './context-items';
import { Context, Optional } from './context';
import { Location } from './base';
export declare class ContextBuilder {
    private readonly stack;
    private fields;
    private locations;
    private message;
    private optional;
    private requestBail;
    setFields(fields: string[]): this;
    setLocations(locations: Location[]): this;
    setMessage(message: any): this;
    addItem(...items: ContextItem[]): this;
    setOptional(options: Optional): this;
    setRequestBail(): this;
    build(): Context;
}
