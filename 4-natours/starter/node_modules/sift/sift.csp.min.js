(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.sift = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var typeChecker = function (type) {
        var typeString = "[object " + type + "]";
        return function (value) {
            return getClassName(value) === typeString;
        };
    };
    var getClassName = function (value) { return Object.prototype.toString.call(value); };
    var comparable = function (value) {
        if (value instanceof Date) {
            return value.getTime();
        }
        else if (isArray(value)) {
            return value.map(comparable);
        }
        else if (value && typeof value.toJSON === "function") {
            return value.toJSON();
        }
        return value;
    };
    var isArray = typeChecker("Array");
    var isObject = typeChecker("Object");
    var isFunction = typeChecker("Function");
    var isVanillaObject = function (value) {
        return (value &&
            (value.constructor === Object ||
                value.constructor === Array ||
                value.constructor.toString() === "function Object() { [native code] }" ||
                value.constructor.toString() === "function Array() { [native code] }") &&
            !value.toJSON);
    };
    var equals = function (a, b) {
        if (a == null && a == b) {
            return true;
        }
        if (a === b) {
            return true;
        }
        if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
            return false;
        }
        if (isArray(a)) {
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0, length_1 = a.length; i < length_1; i++) {
                if (!equals(a[i], b[i]))
                    return false;
            }
            return true;
        }
        else if (isObject(a)) {
            if (Object.keys(a).length !== Object.keys(b).length) {
                return false;
            }
            for (var key in a) {
                if (!equals(a[key], b[key]))
                    return false;
            }
            return true;
        }
        return false;
    };

    /**
     * Walks through each value given the context - used for nested operations. E.g:
     * { "person.address": { $eq: "blarg" }}
     */
    var walkKeyPathValues = function (item, keyPath, next, depth, key, owner) {
        var currentKey = keyPath[depth];
        // if array, then try matching. Might fall through for cases like:
        // { $eq: [1, 2, 3] }, [ 1, 2, 3 ].
        if (isArray(item) && isNaN(Number(currentKey))) {
            for (var i = 0, length_1 = item.length; i < length_1; i++) {
                // if FALSE is returned, then terminate walker. For operations, this simply
                // means that the search critera was met.
                if (!walkKeyPathValues(item[i], keyPath, next, depth, i, item)) {
                    return false;
                }
            }
        }
        if (depth === keyPath.length || item == null) {
            return next(item, key, owner);
        }
        return walkKeyPathValues(item[currentKey], keyPath, next, depth + 1, currentKey, item);
    };
    var BaseOperation = /** @class */ (function () {
        function BaseOperation(params, owneryQuery, options) {
            this.params = params;
            this.owneryQuery = owneryQuery;
            this.options = options;
            this.init();
        }
        BaseOperation.prototype.init = function () { };
        BaseOperation.prototype.reset = function () {
            this.done = false;
            this.keep = false;
        };
        return BaseOperation;
    }());
    var NamedBaseOperation = /** @class */ (function (_super) {
        __extends(NamedBaseOperation, _super);
        function NamedBaseOperation(params, owneryQuery, options, name) {
            var _this = _super.call(this, params, owneryQuery, options) || this;
            _this.name = name;
            return _this;
        }
        return NamedBaseOperation;
    }(BaseOperation));
    var GroupOperation = /** @class */ (function (_super) {
        __extends(GroupOperation, _super);
        function GroupOperation(params, owneryQuery, options, children) {
            var _this = _super.call(this, params, owneryQuery, options) || this;
            _this.children = children;
            return _this;
        }
        /**
         */
        GroupOperation.prototype.reset = function () {
            this.keep = false;
            this.done = false;
            for (var i = 0, length_2 = this.children.length; i < length_2; i++) {
                this.children[i].reset();
            }
        };
        /**
         */
        GroupOperation.prototype.childrenNext = function (item, key, owner) {
            var done = true;
            var keep = true;
            for (var i = 0, length_3 = this.children.length; i < length_3; i++) {
                var childOperation = this.children[i];
                childOperation.next(item, key, owner);
                if (!childOperation.keep) {
                    keep = false;
                }
                if (childOperation.done) {
                    if (!childOperation.keep) {
                        break;
                    }
                }
                else {
                    done = false;
                }
            }
            this.done = done;
            this.keep = keep;
        };
        return GroupOperation;
    }(BaseOperation));
    var NamedGroupOperation = /** @class */ (function (_super) {
        __extends(NamedGroupOperation, _super);
        function NamedGroupOperation(params, owneryQuery, options, children, name) {
            var _this = _super.call(this, params, owneryQuery, options, children) || this;
            _this.name = name;
            return _this;
        }
        return NamedGroupOperation;
    }(GroupOperation));
    var QueryOperation = /** @class */ (function (_super) {
        __extends(QueryOperation, _super);
        function QueryOperation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         */
        QueryOperation.prototype.next = function (item, key, parent) {
            this.childrenNext(item, key, parent);
        };
        return QueryOperation;
    }(GroupOperation));
    var NestedOperation = /** @class */ (function (_super) {
        __extends(NestedOperation, _super);
        function NestedOperation(keyPath, params, owneryQuery, options, children) {
            var _this = _super.call(this, params, owneryQuery, options, children) || this;
            _this.keyPath = keyPath;
            /**
             */
            _this._nextNestedValue = function (value, key, owner) {
                _this.childrenNext(value, key, owner);
                return !_this.done;
            };
            return _this;
        }
        /**
         */
        NestedOperation.prototype.next = function (item, key, parent) {
            walkKeyPathValues(item, this.keyPath, this._nextNestedValue, 0, key, parent);
        };
        return NestedOperation;
    }(GroupOperation));
    var createTester = function (a, compare) {
        if (a instanceof Function) {
            return a;
        }
        if (a instanceof RegExp) {
            return function (b) {
                var result = typeof b === "string" && a.test(b);
                a.lastIndex = 0;
                return result;
            };
        }
        var comparableA = comparable(a);
        return function (b) { return compare(comparableA, comparable(b)); };
    };
    var EqualsOperation = /** @class */ (function (_super) {
        __extends(EqualsOperation, _super);
        function EqualsOperation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EqualsOperation.prototype.init = function () {
            this._test = createTester(this.params, this.options.compare);
        };
        EqualsOperation.prototype.next = function (item, key, parent) {
            if (!Array.isArray(parent) || parent.hasOwnProperty(key)) {
                if (this._test(item, key, parent)) {
                    this.done = true;
                    this.keep = true;
                }
            }
        };
        return EqualsOperation;
    }(BaseOperation));
    var createEqualsOperation = function (params, owneryQuery, options) { return new EqualsOperation(params, owneryQuery, options); };
    var NopeOperation = /** @class */ (function (_super) {
        __extends(NopeOperation, _super);
        function NopeOperation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NopeOperation.prototype.next = function () {
            this.done = true;
            this.keep = false;
        };
        return NopeOperation;
    }(BaseOperation));
    var numericalOperationCreator = function (createNumericalOperation) { return function (params, owneryQuery, options, name) {
        if (params == null) {
            return new NopeOperation(params, owneryQuery, options);
        }
        return createNumericalOperation(params, owneryQuery, options, name);
    }; };
    var numericalOperation = function (createTester) {
        return numericalOperationCreator(function (params, owneryQuery, options) {
            var typeofParams = typeof comparable(params);
            var test = createTester(params);
            return new EqualsOperation(function (b) {
                return typeof comparable(b) === typeofParams && test(b);
            }, owneryQuery, options);
        });
    };
    var createNamedOperation = function (name, params, parentQuery, options) {
        var operationCreator = options.operations[name];
        if (!operationCreator) {
            throw new Error("Unsupported operation: " + name);
        }
        return operationCreator(params, parentQuery, options, name);
    };
    var containsOperation = function (query) {
        for (var key in query) {
            if (key.charAt(0) === "$")
                return true;
        }
        return false;
    };
    var createNestedOperation = function (keyPath, nestedQuery, owneryQuery, options) {
        if (containsOperation(nestedQuery)) {
            var _a = createQueryOperations(nestedQuery, options), selfOperations = _a[0], nestedOperations = _a[1];
            if (nestedOperations.length) {
                throw new Error("Property queries must contain only operations, or exact objects.");
            }
            return new NestedOperation(keyPath, nestedQuery, owneryQuery, options, selfOperations);
        }
        return new NestedOperation(keyPath, nestedQuery, owneryQuery, options, [
            new EqualsOperation(nestedQuery, owneryQuery, options)
        ]);
    };
    var createQueryOperation = function (query, owneryQuery, _a) {
        if (owneryQuery === void 0) { owneryQuery = null; }
        var _b = _a === void 0 ? {} : _a, compare = _b.compare, operations = _b.operations;
        var options = {
            compare: compare || equals,
            operations: Object.assign({}, operations || {})
        };
        var _c = createQueryOperations(query, options), selfOperations = _c[0], nestedOperations = _c[1];
        var ops = [];
        if (selfOperations.length) {
            ops.push(new NestedOperation([], query, owneryQuery, options, selfOperations));
        }
        ops.push.apply(ops, nestedOperations);
        if (ops.length === 1) {
            return ops[0];
        }
        return new QueryOperation(query, owneryQuery, options, ops);
    };
    var createQueryOperations = function (query, options) {
        var selfOperations = [];
        var nestedOperations = [];
        if (!isVanillaObject(query)) {
            selfOperations.push(new EqualsOperation(query, query, options));
            return [selfOperations, nestedOperations];
        }
        for (var key in query) {
            if (key.charAt(0) === "$") {
                var op = createNamedOperation(key, query[key], query, options);
                // probably just a flag for another operation (like $options)
                if (op != null) {
                    selfOperations.push(op);
                }
            }
            else {
                nestedOperations.push(createNestedOperation(key.split("."), query[key], query, options));
            }
        }
        return [selfOperations, nestedOperations];
    };
    var createOperationTester = function (operation) { return function (item, key, owner) {
        operation.reset();
        operation.next(item, key, owner);
        return operation.keep;
    }; };
    var createQueryTester = function (query, options) {
        if (options === void 0) { options = {}; }
        return createOperationTester(createQueryOperation(query, null, options));
    };

    var $Ne = /** @class */ (function (_super) {
        __extends($Ne, _super);
        function $Ne() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Ne.prototype.init = function () {
            this._test = createTester(this.params, this.options.compare);
        };
        $Ne.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this.keep = true;
        };
        $Ne.prototype.next = function (item) {
            if (this._test(item)) {
                this.done = true;
                this.keep = false;
            }
        };
        return $Ne;
    }(NamedBaseOperation));
    // https://docs.mongodb.com/manual/reference/operator/query/elemMatch/
    var $ElemMatch = /** @class */ (function (_super) {
        __extends($ElemMatch, _super);
        function $ElemMatch() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $ElemMatch.prototype.init = function () {
            this._queryOperation = createQueryOperation(this.params, this.owneryQuery, this.options);
        };
        $ElemMatch.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this._queryOperation.reset();
        };
        $ElemMatch.prototype.next = function (item) {
            if (isArray(item)) {
                for (var i = 0, length_1 = item.length; i < length_1; i++) {
                    // reset query operation since item being tested needs to pass _all_ query
                    // operations for it to be a success
                    this._queryOperation.reset();
                    // check item
                    this._queryOperation.next(item[i], i, item);
                    this.keep = this.keep || this._queryOperation.keep;
                }
                this.done = true;
            }
            else {
                this.done = false;
                this.keep = false;
            }
        };
        return $ElemMatch;
    }(NamedBaseOperation));
    var $Not = /** @class */ (function (_super) {
        __extends($Not, _super);
        function $Not() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Not.prototype.init = function () {
            this._queryOperation = createQueryOperation(this.params, this.owneryQuery, this.options);
        };
        $Not.prototype.reset = function () {
            this._queryOperation.reset();
        };
        $Not.prototype.next = function (item, key, owner) {
            this._queryOperation.next(item, key, owner);
            this.done = this._queryOperation.done;
            this.keep = !this._queryOperation.keep;
        };
        return $Not;
    }(NamedBaseOperation));
    var $Size = /** @class */ (function (_super) {
        __extends($Size, _super);
        function $Size() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Size.prototype.init = function () { };
        $Size.prototype.next = function (item) {
            if (isArray(item) && item.length === this.params) {
                this.done = true;
                this.keep = true;
            }
            // if (parent && parent.length === this.params) {
            //   this.done = true;
            //   this.keep = true;
            // }
        };
        return $Size;
    }(NamedBaseOperation));
    var $Or = /** @class */ (function (_super) {
        __extends($Or, _super);
        function $Or() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Or.prototype.init = function () {
            var _this = this;
            this._ops = this.params.map(function (op) {
                return createQueryOperation(op, null, _this.options);
            });
        };
        $Or.prototype.reset = function () {
            this.done = false;
            this.keep = false;
            for (var i = 0, length_2 = this._ops.length; i < length_2; i++) {
                this._ops[i].reset();
            }
        };
        $Or.prototype.next = function (item, key, owner) {
            var done = false;
            var success = false;
            for (var i = 0, length_3 = this._ops.length; i < length_3; i++) {
                var op = this._ops[i];
                op.next(item, key, owner);
                if (op.keep) {
                    done = true;
                    success = op.keep;
                    break;
                }
            }
            this.keep = success;
            this.done = done;
        };
        return $Or;
    }(NamedBaseOperation));
    var $Nor = /** @class */ (function (_super) {
        __extends($Nor, _super);
        function $Nor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Nor.prototype.next = function (item, key, owner) {
            _super.prototype.next.call(this, item, key, owner);
            this.keep = !this.keep;
        };
        return $Nor;
    }($Or));
    var $In = /** @class */ (function (_super) {
        __extends($In, _super);
        function $In() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $In.prototype.init = function () {
            var _this = this;
            this._testers = this.params.map(function (value) {
                if (containsOperation(value)) {
                    throw new Error("cannot nest $ under " + _this.constructor.name.toLowerCase());
                }
                return createTester(value, _this.options.compare);
            });
        };
        $In.prototype.next = function (item, key, owner) {
            var done = false;
            var success = false;
            for (var i = 0, length_4 = this._testers.length; i < length_4; i++) {
                var test = this._testers[i];
                if (test(item)) {
                    done = true;
                    success = true;
                    break;
                }
            }
            this.keep = success;
            this.done = done;
        };
        return $In;
    }(NamedBaseOperation));
    var $Nin = /** @class */ (function (_super) {
        __extends($Nin, _super);
        function $Nin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Nin.prototype.next = function (item, key, owner) {
            _super.prototype.next.call(this, item, key, owner);
            this.keep = !this.keep;
        };
        return $Nin;
    }($In));
    var $Exists = /** @class */ (function (_super) {
        __extends($Exists, _super);
        function $Exists() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        $Exists.prototype.next = function (item, key, owner) {
            if (owner.hasOwnProperty(key) === this.params) {
                this.done = true;
                this.keep = true;
            }
        };
        return $Exists;
    }(NamedBaseOperation));
    var $And = /** @class */ (function (_super) {
        __extends($And, _super);
        function $And(params, owneryQuery, options, name) {
            return _super.call(this, params, owneryQuery, options, params.map(function (query) { return createQueryOperation(query, owneryQuery, options); }), name) || this;
        }
        $And.prototype.next = function (item, key, owner) {
            this.childrenNext(item, key, owner);
        };
        return $And;
    }(NamedGroupOperation));
    var $eq = function (params, owneryQuery, options) {
        return new EqualsOperation(params, owneryQuery, options);
    };
    var $ne = function (params, owneryQuery, options, name) { return new $Ne(params, owneryQuery, options, name); };
    var $or = function (params, owneryQuery, options, name) { return new $Or(params, owneryQuery, options, name); };
    var $nor = function (params, owneryQuery, options, name) { return new $Nor(params, owneryQuery, options, name); };
    var $elemMatch = function (params, owneryQuery, options, name) { return new $ElemMatch(params, owneryQuery, options, name); };
    var $nin = function (params, owneryQuery, options, name) { return new $Nin(params, owneryQuery, options, name); };
    var $in = function (params, owneryQuery, options, name) { return new $In(params, owneryQuery, options, name); };
    var $lt = numericalOperation(function (params) { return function (b) { return b < params; }; });
    var $lte = numericalOperation(function (params) { return function (b) { return b <= params; }; });
    var $gt = numericalOperation(function (params) { return function (b) { return b > params; }; });
    var $gte = numericalOperation(function (params) { return function (b) { return b >= params; }; });
    var $mod = function (_a, owneryQuery, options) {
        var mod = _a[0], equalsValue = _a[1];
        return new EqualsOperation(function (b) { return comparable(b) % mod === equalsValue; }, owneryQuery, options);
    };
    var $exists = function (params, owneryQuery, options, name) { return new $Exists(params, owneryQuery, options, name); };
    var $regex = function (pattern, owneryQuery, options) {
        return new EqualsOperation(new RegExp(pattern, owneryQuery.$options), owneryQuery, options);
    };
    var $not = function (params, owneryQuery, options, name) { return new $Not(params, owneryQuery, options, name); };
    var typeAliases = {
        number: function (v) { return typeof v === "number"; },
        string: function (v) { return typeof v === "string"; },
        bool: function (v) { return typeof v === "boolean"; },
        array: function (v) { return Array.isArray(v); },
        null: function (v) { return v === null; },
        timestamp: function (v) { return v instanceof Date; }
    };
    var $type = function (clazz, owneryQuery, options) {
        return new EqualsOperation(function (b) {
            if (typeof clazz === "string") {
                if (!typeAliases[clazz]) {
                    throw new Error("Type alias does not exist");
                }
                return typeAliases[clazz](b);
            }
            return b != null ? b instanceof clazz || b.constructor === clazz : false;
        }, owneryQuery, options);
    };
    var $and = function (params, ownerQuery, options, name) { return new $And(params, ownerQuery, options, name); };
    var $all = $and;
    var $size = function (params, ownerQuery, options) { return new $Size(params, ownerQuery, options, "$size"); };
    var $options = function () { return null; };
    var $where = function (params, ownerQuery, options) {
        var test;
        if (isFunction(params)) {
            test = params;
        }
        else {
            throw new Error("In CSP mode, sift does not support strings in \"$where\" condition");
        }
        return new EqualsOperation(function (b) { return test.bind(b)(b); }, ownerQuery, options);
    };

    var defaultOperations = /*#__PURE__*/Object.freeze({
        __proto__: null,
        $Size: $Size,
        $eq: $eq,
        $ne: $ne,
        $or: $or,
        $nor: $nor,
        $elemMatch: $elemMatch,
        $nin: $nin,
        $in: $in,
        $lt: $lt,
        $lte: $lte,
        $gt: $gt,
        $gte: $gte,
        $mod: $mod,
        $exists: $exists,
        $regex: $regex,
        $not: $not,
        $type: $type,
        $and: $and,
        $all: $all,
        $size: $size,
        $options: $options,
        $where: $where
    });

    var createDefaultQueryOperation = function (query, ownerQuery, _a) {
        var _b = _a === void 0 ? {} : _a, compare = _b.compare, operations = _b.operations;
        return createQueryOperation(query, ownerQuery, {
            compare: compare,
            operations: Object.assign({}, defaultOperations, operations || {})
        });
    };
    var createDefaultQueryTester = function (query, options) {
        if (options === void 0) { options = {}; }
        var op = createDefaultQueryOperation(query, null, options);
        return createOperationTester(op);
    };

    exports.$Size = $Size;
    exports.$all = $all;
    exports.$and = $and;
    exports.$elemMatch = $elemMatch;
    exports.$eq = $eq;
    exports.$exists = $exists;
    exports.$gt = $gt;
    exports.$gte = $gte;
    exports.$in = $in;
    exports.$lt = $lt;
    exports.$lte = $lte;
    exports.$mod = $mod;
    exports.$ne = $ne;
    exports.$nin = $nin;
    exports.$nor = $nor;
    exports.$not = $not;
    exports.$options = $options;
    exports.$or = $or;
    exports.$regex = $regex;
    exports.$size = $size;
    exports.$type = $type;
    exports.$where = $where;
    exports.EqualsOperation = EqualsOperation;
    exports.createDefaultQueryOperation = createDefaultQueryOperation;
    exports.createEqualsOperation = createEqualsOperation;
    exports.createOperationTester = createOperationTester;
    exports.createQueryOperation = createQueryOperation;
    exports.createQueryTester = createQueryTester;
    exports.default = createDefaultQueryTester;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=sift.csp.min.js.map
