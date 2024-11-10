import callBind from 'call-bind';
import callBound from 'call-bind/callBound';
import RequireObjectCoercible from 'es-abstract/2023/RequireObjectCoercible.js';

import getPolyfill from 'array.prototype.findlast/polyfill';

const bound = callBind.apply(getPolyfill());
const $slice = callBound('Array.prototype.slice');

// eslint-disable-next-line no-unused-vars
export default function findLast(array, predicate) {
	RequireObjectCoercible(array);
	return bound(array, $slice(arguments, 1));
}

export { default as getPolyfill } from 'array.prototype.findlast/polyfill';
export { default as implementation } from 'array.prototype.findlast/implementation';
export { default as shim } from 'array.prototype.findlast/shim';
