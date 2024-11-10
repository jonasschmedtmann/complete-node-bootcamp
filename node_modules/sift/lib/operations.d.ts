import { NamedBaseOperation, EqualsOperation, Options, Operation, Query, NamedGroupOperation } from "./core";
import { Key } from "./utils";
declare class $Ne extends NamedBaseOperation<any> {
    private _test;
    init(): void;
    reset(): void;
    next(item: any): void;
}
declare class $ElemMatch extends NamedBaseOperation<Query<any>> {
    private _queryOperation;
    init(): void;
    reset(): void;
    next(item: any): void;
}
declare class $Not extends NamedBaseOperation<Query<any>> {
    private _queryOperation;
    init(): void;
    reset(): void;
    next(item: any, key: Key, owner: any): void;
}
export declare class $Size extends NamedBaseOperation<any> {
    init(): void;
    next(item: any): void;
}
declare class $Or extends NamedBaseOperation<any> {
    private _ops;
    init(): void;
    reset(): void;
    next(item: any, key: Key, owner: any): void;
}
declare class $Nor extends $Or {
    next(item: any, key: Key, owner: any): void;
}
declare class $In extends NamedBaseOperation<any> {
    private _testers;
    init(): void;
    next(item: any, key: Key, owner: any): void;
}
declare class $Nin extends $In {
    next(item: any, key: Key, owner: any): void;
}
declare class $Exists extends NamedBaseOperation<boolean> {
    next(item: any, key: Key, owner: any): void;
}
declare class $And extends NamedGroupOperation {
    constructor(params: Query<any>[], owneryQuery: Query<any>, options: Options, name: string);
    next(item: any, key: Key, owner: any): void;
}
export declare const $eq: (params: any, owneryQuery: any, options: Options) => EqualsOperation<any>;
export declare const $ne: (params: any, owneryQuery: any, options: Options, name: string) => $Ne;
export declare const $or: (params: any[], owneryQuery: any, options: Options, name: string) => $Or;
export declare const $nor: (params: any[], owneryQuery: any, options: Options, name: string) => $Nor;
export declare const $elemMatch: (params: any, owneryQuery: any, options: Options, name: string) => $ElemMatch;
export declare const $nin: (params: any, owneryQuery: any, options: Options, name: string) => $Nin;
export declare const $in: (params: any, owneryQuery: any, options: Options, name: string) => $In;
export declare const $lt: (params: any, owneryQuery: any, options: Options, name: string) => Operation<any> | import("./core").NopeOperation<any>;
export declare const $lte: (params: any, owneryQuery: any, options: Options, name: string) => Operation<any> | import("./core").NopeOperation<any>;
export declare const $gt: (params: any, owneryQuery: any, options: Options, name: string) => Operation<any> | import("./core").NopeOperation<any>;
export declare const $gte: (params: any, owneryQuery: any, options: Options, name: string) => Operation<any> | import("./core").NopeOperation<any>;
export declare const $mod: ([mod, equalsValue]: number[], owneryQuery: any, options: Options) => EqualsOperation<(b: any) => boolean>;
export declare const $exists: (params: boolean, owneryQuery: any, options: Options, name: string) => $Exists;
export declare const $regex: (pattern: string, owneryQuery: any, options: Options) => EqualsOperation<RegExp>;
export declare const $not: (params: any, owneryQuery: any, options: Options, name: string) => $Not;
export declare const $type: (clazz: TimerHandler, owneryQuery: any, options: Options) => EqualsOperation<(b: any) => any>;
export declare const $and: (params: any[], ownerQuery: any, options: Options, name: string) => $And;
export declare const $all: (params: any[], ownerQuery: any, options: Options, name: string) => $And;
export declare const $size: (params: number, ownerQuery: any, options: Options) => $Size;
export declare const $options: () => any;
export declare const $where: (params: TimerHandler, ownerQuery: any, options: Options) => EqualsOperation<(b: any) => any>;
export {};
