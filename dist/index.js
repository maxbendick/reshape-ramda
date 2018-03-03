'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lensFromPattern = exports.makeSetter = exports.makeGetter = exports.makePaths = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ramda = require('ramda');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // @ts-check


var makePaths = exports.makePaths = function makePaths(pattern) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


  var pathsMap = {};

  var pathsRec = function pathsRec(pattern) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var keys = Object.keys(pattern);
    keys.forEach(function (k) {

      if (typeof pattern[k] === 'string') pathsMap[pattern[k]] = [].concat(_toConsumableArray(path), [k]);else if (_typeof(pattern[k]) === 'object') pathsRec(pattern[k], [].concat(_toConsumableArray(path), [k]));
    });
  };

  pathsRec(pattern);
  return pathsMap;
};

var makeGetter = exports.makeGetter = function makeGetter(paths) {
  return function (x) {
    var variables = Object.keys(paths);

    var res = {};

    variables.forEach(function (v) {
      res[v] = (0, _ramda.path)(paths[v], x);
    });

    return res;
  };
};

var makeSetter = exports.makeSetter = function makeSetter(paths) {
  return function (newInner, oldOutter) {
    var variables = Object.keys(paths);

    var res = _extends({}, oldOutter);

    variables.forEach(function (v) {
      res = (0, _ramda.assocPath)(paths[v], newInner[v], res);
    });

    return res;
  };
};

var lensFromPattern = exports.lensFromPattern = function lensFromPattern(pattern) {
  var paths = makePaths(pattern);
  var getter = makeGetter(paths);
  var setter = makeSetter(paths);

  return (0, _ramda.lens)(getter, setter);
};