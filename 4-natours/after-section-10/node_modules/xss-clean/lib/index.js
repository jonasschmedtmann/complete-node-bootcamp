'use strict';

var _xss = require('./xss');

module.exports = function () {
  return function (req, res, next) {
    if (req.body) req.body = (0, _xss.clean)(req.body);
    if (req.query) req.query = (0, _xss.clean)(req.query);
    if (req.params) req.params = (0, _xss.clean)(req.params);

    next();
  };
};
//# sourceMappingURL=index.js.map