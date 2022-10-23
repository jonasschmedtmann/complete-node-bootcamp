"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function Agent() {
  this._defaults = [];
}

for (var _i = 0, _arr = ['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts']; _i < _arr.length; _i++) {
  const fn = _arr[_i];

  // Default setting for all requests from this agent
  Agent.prototype[fn] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this._defaults.push({
      fn,
      args
    });

    return this;
  };
}

Agent.prototype._setDefaults = function (request) {
  var _iterator = _createForOfIteratorHelper(this._defaults),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const def = _step.value;
      request[def.fn](...def.args);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

module.exports = Agent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZ2VudCIsIl9kZWZhdWx0cyIsImZuIiwicHJvdG90eXBlIiwiYXJncyIsInB1c2giLCJfc2V0RGVmYXVsdHMiLCJyZXF1ZXN0IiwiZGVmIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9hZ2VudC1iYXNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEFnZW50KCkge1xuICB0aGlzLl9kZWZhdWx0cyA9IFtdO1xufVxuXG5mb3IgKGNvbnN0IGZuIG9mIFtcbiAgJ3VzZScsXG4gICdvbicsXG4gICdvbmNlJyxcbiAgJ3NldCcsXG4gICdxdWVyeScsXG4gICd0eXBlJyxcbiAgJ2FjY2VwdCcsXG4gICdhdXRoJyxcbiAgJ3dpdGhDcmVkZW50aWFscycsXG4gICdzb3J0UXVlcnknLFxuICAncmV0cnknLFxuICAnb2snLFxuICAncmVkaXJlY3RzJyxcbiAgJ3RpbWVvdXQnLFxuICAnYnVmZmVyJyxcbiAgJ3NlcmlhbGl6ZScsXG4gICdwYXJzZScsXG4gICdjYScsXG4gICdrZXknLFxuICAncGZ4JyxcbiAgJ2NlcnQnLFxuICAnZGlzYWJsZVRMU0NlcnRzJ1xuXSkge1xuICAvLyBEZWZhdWx0IHNldHRpbmcgZm9yIGFsbCByZXF1ZXN0cyBmcm9tIHRoaXMgYWdlbnRcbiAgQWdlbnQucHJvdG90eXBlW2ZuXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgdGhpcy5fZGVmYXVsdHMucHVzaCh7IGZuLCBhcmdzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuX3NldERlZmF1bHRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgZm9yIChjb25zdCBkZWYgb2YgdGhpcy5fZGVmYXVsdHMpIHtcbiAgICByZXF1ZXN0W2RlZi5mbl0oLi4uZGVmLmFyZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnZW50O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQVNBLEtBQVQsR0FBaUI7RUFDZixLQUFLQyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0Q7O0FBRUQsd0JBQWlCLENBQ2YsS0FEZSxFQUVmLElBRmUsRUFHZixNQUhlLEVBSWYsS0FKZSxFQUtmLE9BTGUsRUFNZixNQU5lLEVBT2YsUUFQZSxFQVFmLE1BUmUsRUFTZixpQkFUZSxFQVVmLFdBVmUsRUFXZixPQVhlLEVBWWYsSUFaZSxFQWFmLFdBYmUsRUFjZixTQWRlLEVBZWYsUUFmZSxFQWdCZixXQWhCZSxFQWlCZixPQWpCZSxFQWtCZixJQWxCZSxFQW1CZixLQW5CZSxFQW9CZixLQXBCZSxFQXFCZixNQXJCZSxFQXNCZixpQkF0QmUsQ0FBakIsMEJBdUJHO0VBdkJFLE1BQU1DLEVBQUUsV0FBUjs7RUF3Qkg7RUFDQUYsS0FBSyxDQUFDRyxTQUFOLENBQWdCRCxFQUFoQixJQUFzQixZQUFtQjtJQUFBLGtDQUFORSxJQUFNO01BQU5BLElBQU07SUFBQTs7SUFDdkMsS0FBS0gsU0FBTCxDQUFlSSxJQUFmLENBQW9CO01BQUVILEVBQUY7TUFBTUU7SUFBTixDQUFwQjs7SUFDQSxPQUFPLElBQVA7RUFDRCxDQUhEO0FBSUQ7O0FBRURKLEtBQUssQ0FBQ0csU0FBTixDQUFnQkcsWUFBaEIsR0FBK0IsVUFBVUMsT0FBVixFQUFtQjtFQUFBLDJDQUM5QixLQUFLTixTQUR5QjtFQUFBOztFQUFBO0lBQ2hELG9EQUFrQztNQUFBLE1BQXZCTyxHQUF1QjtNQUNoQ0QsT0FBTyxDQUFDQyxHQUFHLENBQUNOLEVBQUwsQ0FBUCxDQUFnQixHQUFHTSxHQUFHLENBQUNKLElBQXZCO0lBQ0Q7RUFIK0M7SUFBQTtFQUFBO0lBQUE7RUFBQTtBQUlqRCxDQUpEOztBQU1BSyxNQUFNLENBQUNDLE9BQVAsR0FBaUJWLEtBQWpCIn0=