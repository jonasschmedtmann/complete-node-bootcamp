## 13.1.0

- Added stronger types for queries: https://github.com/crcn/sift.js/issues/197

## 13.0.0

- Fix behavior discrepancy with Mongo: https://github.com/crcn/sift.js/issues/196

## 12.0.0

- Fix bug where \$elemMatch tested objects: e.g: `sift({a: {$elemMatch: 1}})({ a: { b: 1}})`. \$elemMatch now expects arrays based on Mongodb syntax. E.g: `sift({a: {$elemMatch: 1}})({ a: { b: 1}})`

## 11.0.0

- new custom operations syntax (see API readme)
- null & undefined are not treated equally (change has been added to keep spec as functionality as possible to MongoDB)
- `select` option has been removed
- `compare` option now expects `boolean` return value instead of an integer
- nested queries are no-longer supported
- `expressions` option is now `operations`
- `operations` parameter now expects new operations API
- ImmutableJS support removed for now
- Remove bower support

## 9.0.0

- (behavior change) toJSON works for vanilla objects.

## 8.5.1

- Fix dependency vulnerability
- Fix #158

## 8.5.0

- Added `comparable` option (fix https://github.com/crcn/sift.js/issues/156)

## 8.4.0

- Added `compare` option (fix https://github.com/crcn/sift.js/issues/155)

## 8.3.2

- Query _properties_ now excpect exact object shape (based on https://github.com/crcn/sift.js/issues/152). E.g: `[{a: { b: 1}}, {a: { b: 1, c: 2}}]].filter(sift({ a: { b: 1} })) === [{a: {b: 1}]`, and `[{a: 1, b: 1}, {a: 1}]].filter(sift({ a: 1 })) === [{a: 1, b: 1}, {a: 1}]`.

## 8.0.0

- DEPRECATED `indexOf` in favor of `array.findIndex(sift(query))`
- second param is now `options` instead of select function. E.g: `sift(query, { expressions: customExpressions, select: selectValue })`
- DEPRECATED `sift(query, array)`. You must now use `array.filter(sift(query))`
- Queries now expect exact object shape (based on https://github.com/crcn/sift.js/issues/117). E.g: `[{a: 1, b: 1}, {a: 1}]].filter(sift({ a: 1 })) === [{a: 1}]`

### 7.0.0

- Remove global `*.use()` function.
- converted to ES6

### 3.3.x

- `$in` now uses `toString()` when evaluating objects. Fixes #116.

#### 2.x

- `use()` now uses a different format:

```javascript
sift.use({
  $operator: function(a) {
    return function(b) {
      // compare here
    };
  }
});
```

- all operators are traversable now
- fix #58.
