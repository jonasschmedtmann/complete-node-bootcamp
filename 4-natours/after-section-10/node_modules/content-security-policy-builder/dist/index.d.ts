interface PolicyBuilderOptions {
    directives: {
        [directive: string]: string[] | string | boolean;
    };
}
declare const _default: ({ directives }: PolicyBuilderOptions) => string;
export = _default;
