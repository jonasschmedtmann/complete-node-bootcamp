"use strict";
const defaults = require("defaults");
const MemoryStore = require("./memory-store");

function RateLimit(options) {
  options = defaults(options, {
    windowMs: 60 * 1000, // milliseconds - how long to keep records of requests in memory
    max: 5, // max number of recent connections during `window` milliseconds before sending a 429 response
    message: "Too many requests, please try again later.",
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
    headers: true, //Send custom rate limit header with limit and remaining
    skipFailedRequests: false, // Do not count failed requests (status >= 400)
    skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
    // allows to create custom keys (by default user IP is used)
    keyGenerator: function(req /*, res*/) {
      return req.ip;
    },
    skip: function(/*req, res*/) {
      return false;
    },
    handler: function(req, res /*, next*/) {
      res.status(options.statusCode).send(options.message);
    },
    onLimitReached: function(/*req, res, optionsUsed*/) {}
  });

  // store to use for persisting rate limit data
  options.store = options.store || new MemoryStore(options.windowMs);

  // ensure that the store has the incr method
  if (
    typeof options.store.incr !== "function" ||
    typeof options.store.resetKey !== "function" ||
    (options.skipFailedRequests &&
      typeof options.store.decrement !== "function")
  ) {
    throw new Error("The store is not valid.");
  }

  ["global", "delayMs", "delayAfter"].forEach(key => {
    // note: this doesn't trigger if delayMs or delayAfter are set to 0, because that essentially disables them
    if (options[key]) {
      throw new Error(
        `The ${key} option was removed from express-rate-limit v3.`
      );
    }
  });

  function rateLimit(req, res, next) {
    if (options.skip(req, res)) {
      return next();
    }

    const key = options.keyGenerator(req, res);

    options.store.incr(key, function(err, current, resetTime) {
      if (err) {
        return next(err);
      }

      const maxResult =
        typeof options.max === "function" ? options.max(req, res) : options.max;

      Promise.resolve(maxResult)
        .catch(next)
        .then(max => {
          req.rateLimit = {
            limit: max,
            current: current,
            remaining: Math.max(max - current, 0),
            resetTime: resetTime
          };

          if (options.headers) {
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", req.rateLimit.remaining);
            if (resetTime instanceof Date) {
              // if we have a resetTime, also provide the current date to help avoid issues with incorrect clocks
              res.setHeader("Date", new Date().toGMTString());
              res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil(resetTime.getTime() / 1000)
              );
            }
          }

          if (options.skipFailedRequests || options.skipSuccessfulRequests) {
            let decremented = false;
            const decrementKey = () => {
              if (!decremented) {
                options.store.decrement(key);
                decremented = true;
              }
            };

            if (options.skipFailedRequests) {
              res.on("finish", function() {
                if (res.statusCode >= 400) {
                  decrementKey();
                }
              });

              res.on("close", () => {
                if (!res.finished) {
                  decrementKey();
                }
              });

              res.on("error", () => decrementKey());
            }

            if (options.skipSuccessfulRequests) {
              res.on("finish", function() {
                if (res.statusCode < 400) {
                  options.store.decrement(key);
                }
              });
            }
          }

          if (max && current === max + 1) {
            options.onLimitReached(req, res, options);
          }

          if (max && current > max) {
            if (options.headers) {
              res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
            }
            return options.handler(req, res, next);
          }

          next();
        });
    });
  }

  rateLimit.resetKey = options.store.resetKey.bind(options.store);

  // Backward compatibility function
  rateLimit.resetIp = rateLimit.resetKey;

  return rateLimit;
}

module.exports = RateLimit;
