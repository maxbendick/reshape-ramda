'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lensFromPattern = exports.makeSetter = exports.makeGetter = exports.makePaths = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ramda = require('ramda');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // @ts-check


/**
 * Returns a map from strings to arrays of strings.
 * Each array of strings is a path through the 
 * pattern object to the location of the matching
 * key (a string).
 * 
 * Ex: makePaths({
 *       a: 'b',
 *       c: { d: 'e' }
 *     })
 * >>> { b: ['a'], e: ['c', 'd'] }
 */
var makePaths = exports.makePaths = function makePaths(pattern) {

  var pathsMap = {};

  var pathsRec = function pathsRec(pattern) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var keys = Object.keys(pattern);
    keys.forEach(function (k) {

      // if value is a string, bind that path to an eponymous property
      if (typeof pattern[k] === 'string') pathsMap[pattern[k]] = [].concat(_toConsumableArray(path), [k]);else if (_typeof(pattern[k]) === 'object')
        // continue the search at the next node (depth-first-search)
        pathsRec(pattern[k], [].concat(_toConsumableArray(path), [k]));
    });
  };

  pathsRec(pattern);
  return pathsMap;
};

/**
 * For paths from A to B, returns a function
 * that takes an A and returns a B
 * 
 * Ex: makeGetter({
 *       b: ['a'],
 *       e: ['c', 'd'],
 *     })({
 *       a: 1,
 *       c: { d: 2 },
 *     })
 * >>> { b: 1, e: 2 }
 */
var makeGetter = exports.makeGetter = function makeGetter(paths) {
  return function (x) {
    var propertyNames = Object.keys(paths);
    var res = {};

    propertyNames.forEach(function (p) {
      // set the property `p` of `res` to the value at the appropriate path through `x`
      res[p] = (0, _ramda.path)(paths[p], x);
    });

    return res;
  };
};

/**
 * For paths from A to B, returns a function 
 * that takes a B and an A and returns an A,
 * where properties are to the values of the
 * B through their appropriate paths.
 * 
 * Ex: makeSetter({
 *       b: ['a'],
 *       e: ['c', 'd'],
 *     })(
 *       {
 *         b: 3,
 *         e: 4,
 *       }
 *       {
 *         a: 1,
 *         c: { d: 2 },
 *       }
 *     )
 * >>> {
 *       a: 3,
 *       c: { d: 4 },
 *     }
 */
var makeSetter = exports.makeSetter = function makeSetter(paths) {
  return function (newInner, oldOutter) {
    var variables = Object.keys(paths);

    var res = _extends({}, oldOutter);

    variables.forEach(function (v) {
      // set the value at the relevant path through `res` to the relevant value in `newInner`
      res = (0, _ramda.assocPath)(paths[v], newInner[v], res);
    });

    return res;
  };
};

/**
 * Given a pattern from A to B, return a Lens from A to B
 */
var lensFromPattern = exports.lensFromPattern = function lensFromPattern(pattern) {
  var paths = makePaths(pattern);
  var getter = makeGetter(paths);
  var setter = makeSetter(paths);

  return (0, _ramda.lens)(getter, setter);
};