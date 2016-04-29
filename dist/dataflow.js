!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.dataflow=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2016 Patrick Dubroy <pdubroy@gmail.com>
// This software is distributed under the terms of the MIT License.

'use strict';

// Helpers
// -------

function assert(cond, message) {
  if (!cond) {
    throw new Error(message);
  }
}

assert.equal = function(actual, expected) {
  assert(actual === expected, 'expected ' + expected + ', got ' + actual);
};

// Return a new object containing all of the own properties of `obj`.
function cloneOwn(obj) {
  let result = {};
  Object.keys(obj).forEach(k => { result[k] = obj[k]; });
  return result;
}

// Creates an object composed of the inverted keys and values of `obj`.
function invert(obj) {
  let result = {};
  Object.keys(obj).forEach(k => { result[obj[k]] = k; });
  return result;
}

// Return an array containing the values of all the own properties in `obj`.
function values(obj) {
  let result = [];
  Object.keys(obj).forEach(k => result.push(obj[k]));
  return result;
}

// Return the number of own properties in `obj`.
function countKeys(obj) {
  return Object.keys(obj).length;
}

// Perform a topological sort of the graph using Kahn's algorithm.
function toposort(vars, edges) {
  let sorted = [];
  let varArray = values(vars);

  let edgesOut = cloneOwn(edges);
  let edgesIn = {};
  varArray.forEach(v => { edgesIn[v.name] = invert(v.edgesIn); });

  let roots = varArray.filter(v => countKeys(v.edgesIn) === 0);
  while (roots.length > 0) {
    let newRoots = [];
    roots.forEach(v => {
      let rootName = v.name;
      assert.equal(countKeys(edgesIn[rootName]), 0);

      let outNames = edgesOut[rootName];
      outNames.forEach(varName => {
        delete edgesIn[varName][rootName];
        if (countKeys(edgesIn[varName]) === 0) {
          newRoots.push(vars[varName]);
        }
      });
      sorted.push(v);
    });
    roots = newRoots;
  }
  assert.equal(sorted.length, varArray.length);
  return sorted;
}

// Graph
// -----

class Graph {
  constructor() {
    this._vars = {};
    this._values = {};
    this._edgesOut = {};

    this._sorted = null;
  }

  _addEdge(fromName, toName) {
    if (!(fromName in this._edgesOut)) {
      this._edgesOut[fromName] = [];
    }
    this._edgesOut[fromName].push(toName);
  }

  _assertDefined(name) {
    if (!(name in this._vars)) {
      throw new Error("variable '" + name + "' is not defined");
    }
  }

  _sortedVars() {
    if (!this._sorted) {
      this._sorted = toposort(this._vars, this._edgesOut);
    }
    return this._sorted;
  }

  _hasValue(varName) {
    return varName in this._values;
  }

  _maybeUpdate(v) {
    let name = v.name;
    if (typeof v.update === 'function') {
      let args = [];
      for (var depName of v.edgesIn) {
        if (!this._hasValue(depName)) {
          return;  // Bail -- one of the deps is not ready.
        }
        args.push(this._values[depName]);
      }
      this._values[name] = v.update.apply(null, args);
    } else if (!this._hasValue(name)) {
      this._values[name] = v.update;
    }
  }

  // Define a new variable named `name`.
  // `deps` is an Array of variable names that the new variable depends on.
  // `valueOrUpdateFn` is either an update function (having the same arity as
  // `deps`) or, if `deps` is empty, the initial value for the variable.
  define(name, deps, valueOrUpdateFn) {
    assert(!(name in this._vars),
           "variable '" + name + "' is already defined");
    this._vars[name] = {
      name: name,
      edgesIn: deps,
      update: valueOrUpdateFn
    };
    deps.forEach(depName => this._addEdge(depName, name));
    this._edgesOut[name] = this._edgesOut[name] || [];
    this._sorted = null;

    if (deps.length === 0) {
      this.set(name, valueOrUpdateFn);
    } else {
      this._maybeUpdate(this._vars[name]);
    }
  }

  // Get the current value of the variable named `name`.
  get(name) {
    this._assertDefined(name);
    return this._values[name];
  }

  // Set the value of the variable named `name` to `value`.
  set(name, value) {
    this._assertDefined(name);
    this._values[name] = value;
    this._sortedVars().forEach(v => this._maybeUpdate(v));
  }
}

// Exports
// -------

module.exports = Graph;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZHVicm95L2Rldi9jZGcvZGF0YWZsb3ciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTYgUGF0cmljayBEdWJyb3kgPHBkdWJyb3lAZ21haWwuY29tPlxuLy8gVGhpcyBzb2Z0d2FyZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVCBMaWNlbnNlLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIEhlbHBlcnNcbi8vIC0tLS0tLS1cblxuZnVuY3Rpb24gYXNzZXJ0KGNvbmQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFjb25kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9XG59XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgYXNzZXJ0KGFjdHVhbCA9PT0gZXhwZWN0ZWQsICdleHBlY3RlZCAnICsgZXhwZWN0ZWQgKyAnLCBnb3QgJyArIGFjdHVhbCk7XG59O1xuXG4vLyBSZXR1cm4gYSBuZXcgb2JqZWN0IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBvd24gcHJvcGVydGllcyBvZiBgb2JqYC5cbmZ1bmN0aW9uIGNsb25lT3duKG9iaikge1xuICBsZXQgcmVzdWx0ID0ge307XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrID0+IHsgcmVzdWx0W2tdID0gb2JqW2tdOyB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gQ3JlYXRlcyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIGludmVydGVkIGtleXMgYW5kIHZhbHVlcyBvZiBgb2JqYC5cbmZ1bmN0aW9uIGludmVydChvYmopIHtcbiAgbGV0IHJlc3VsdCA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goayA9PiB7IHJlc3VsdFtvYmpba11dID0gazsgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFJldHVybiBhbiBhcnJheSBjb250YWluaW5nIHRoZSB2YWx1ZXMgb2YgYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiBgb2JqYC5cbmZ1bmN0aW9uIHZhbHVlcyhvYmopIHtcbiAgbGV0IHJlc3VsdCA9IFtdO1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goayA9PiByZXN1bHQucHVzaChvYmpba10pKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gUmV0dXJuIHRoZSBudW1iZXIgb2Ygb3duIHByb3BlcnRpZXMgaW4gYG9iamAuXG5mdW5jdGlvbiBjb3VudEtleXMob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbn1cblxuLy8gUGVyZm9ybSBhIHRvcG9sb2dpY2FsIHNvcnQgb2YgdGhlIGdyYXBoIHVzaW5nIEthaG4ncyBhbGdvcml0aG0uXG5mdW5jdGlvbiB0b3Bvc29ydCh2YXJzLCBlZGdlcykge1xuICBsZXQgc29ydGVkID0gW107XG4gIGxldCB2YXJBcnJheSA9IHZhbHVlcyh2YXJzKTtcblxuICBsZXQgZWRnZXNPdXQgPSBjbG9uZU93bihlZGdlcyk7XG4gIGxldCBlZGdlc0luID0ge307XG4gIHZhckFycmF5LmZvckVhY2godiA9PiB7IGVkZ2VzSW5bdi5uYW1lXSA9IGludmVydCh2LmVkZ2VzSW4pOyB9KTtcblxuICBsZXQgcm9vdHMgPSB2YXJBcnJheS5maWx0ZXIodiA9PiBjb3VudEtleXModi5lZGdlc0luKSA9PT0gMCk7XG4gIHdoaWxlIChyb290cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IG5ld1Jvb3RzID0gW107XG4gICAgcm9vdHMuZm9yRWFjaCh2ID0+IHtcbiAgICAgIGxldCByb290TmFtZSA9IHYubmFtZTtcbiAgICAgIGFzc2VydC5lcXVhbChjb3VudEtleXMoZWRnZXNJbltyb290TmFtZV0pLCAwKTtcblxuICAgICAgbGV0IG91dE5hbWVzID0gZWRnZXNPdXRbcm9vdE5hbWVdO1xuICAgICAgb3V0TmFtZXMuZm9yRWFjaCh2YXJOYW1lID0+IHtcbiAgICAgICAgZGVsZXRlIGVkZ2VzSW5bdmFyTmFtZV1bcm9vdE5hbWVdO1xuICAgICAgICBpZiAoY291bnRLZXlzKGVkZ2VzSW5bdmFyTmFtZV0pID09PSAwKSB7XG4gICAgICAgICAgbmV3Um9vdHMucHVzaCh2YXJzW3Zhck5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzb3J0ZWQucHVzaCh2KTtcbiAgICB9KTtcbiAgICByb290cyA9IG5ld1Jvb3RzO1xuICB9XG4gIGFzc2VydC5lcXVhbChzb3J0ZWQubGVuZ3RoLCB2YXJBcnJheS5sZW5ndGgpO1xuICByZXR1cm4gc29ydGVkO1xufVxuXG4vLyBHcmFwaFxuLy8gLS0tLS1cblxuY2xhc3MgR3JhcGgge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl92YXJzID0ge307XG4gICAgdGhpcy5fdmFsdWVzID0ge307XG4gICAgdGhpcy5fZWRnZXNPdXQgPSB7fTtcblxuICAgIHRoaXMuX3NvcnRlZCA9IG51bGw7XG4gIH1cblxuICBfYWRkRWRnZShmcm9tTmFtZSwgdG9OYW1lKSB7XG4gICAgaWYgKCEoZnJvbU5hbWUgaW4gdGhpcy5fZWRnZXNPdXQpKSB7XG4gICAgICB0aGlzLl9lZGdlc091dFtmcm9tTmFtZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZWRnZXNPdXRbZnJvbU5hbWVdLnB1c2godG9OYW1lKTtcbiAgfVxuXG4gIF9hc3NlcnREZWZpbmVkKG5hbWUpIHtcbiAgICBpZiAoIShuYW1lIGluIHRoaXMuX3ZhcnMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YXJpYWJsZSAnXCIgKyBuYW1lICsgXCInIGlzIG5vdCBkZWZpbmVkXCIpO1xuICAgIH1cbiAgfVxuXG4gIF9zb3J0ZWRWYXJzKCkge1xuICAgIGlmICghdGhpcy5fc29ydGVkKSB7XG4gICAgICB0aGlzLl9zb3J0ZWQgPSB0b3Bvc29ydCh0aGlzLl92YXJzLCB0aGlzLl9lZGdlc091dCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zb3J0ZWQ7XG4gIH1cblxuICBfaGFzVmFsdWUodmFyTmFtZSkge1xuICAgIHJldHVybiB2YXJOYW1lIGluIHRoaXMuX3ZhbHVlcztcbiAgfVxuXG4gIF9tYXliZVVwZGF0ZSh2KSB7XG4gICAgbGV0IG5hbWUgPSB2Lm5hbWU7XG4gICAgaWYgKHR5cGVvZiB2LnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGV0IGFyZ3MgPSBbXTtcbiAgICAgIGZvciAodmFyIGRlcE5hbWUgb2Ygdi5lZGdlc0luKSB7XG4gICAgICAgIGlmICghdGhpcy5faGFzVmFsdWUoZGVwTmFtZSkpIHtcbiAgICAgICAgICByZXR1cm47ICAvLyBCYWlsIC0tIG9uZSBvZiB0aGUgZGVwcyBpcyBub3QgcmVhZHkuXG4gICAgICAgIH1cbiAgICAgICAgYXJncy5wdXNoKHRoaXMuX3ZhbHVlc1tkZXBOYW1lXSk7XG4gICAgICB9XG4gICAgICB0aGlzLl92YWx1ZXNbbmFtZV0gPSB2LnVwZGF0ZS5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNWYWx1ZShuYW1lKSkge1xuICAgICAgdGhpcy5fdmFsdWVzW25hbWVdID0gdi51cGRhdGU7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVmaW5lIGEgbmV3IHZhcmlhYmxlIG5hbWVkIGBuYW1lYC5cbiAgLy8gYGRlcHNgIGlzIGFuIEFycmF5IG9mIHZhcmlhYmxlIG5hbWVzIHRoYXQgdGhlIG5ldyB2YXJpYWJsZSBkZXBlbmRzIG9uLlxuICAvLyBgdmFsdWVPclVwZGF0ZUZuYCBpcyBlaXRoZXIgYW4gdXBkYXRlIGZ1bmN0aW9uIChoYXZpbmcgdGhlIHNhbWUgYXJpdHkgYXNcbiAgLy8gYGRlcHNgKSBvciwgaWYgYGRlcHNgIGlzIGVtcHR5LCB0aGUgaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIHZhcmlhYmxlLlxuICBkZWZpbmUobmFtZSwgZGVwcywgdmFsdWVPclVwZGF0ZUZuKSB7XG4gICAgYXNzZXJ0KCEobmFtZSBpbiB0aGlzLl92YXJzKSxcbiAgICAgICAgICAgXCJ2YXJpYWJsZSAnXCIgKyBuYW1lICsgXCInIGlzIGFscmVhZHkgZGVmaW5lZFwiKTtcbiAgICB0aGlzLl92YXJzW25hbWVdID0ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGVkZ2VzSW46IGRlcHMsXG4gICAgICB1cGRhdGU6IHZhbHVlT3JVcGRhdGVGblxuICAgIH07XG4gICAgZGVwcy5mb3JFYWNoKGRlcE5hbWUgPT4gdGhpcy5fYWRkRWRnZShkZXBOYW1lLCBuYW1lKSk7XG4gICAgdGhpcy5fZWRnZXNPdXRbbmFtZV0gPSB0aGlzLl9lZGdlc091dFtuYW1lXSB8fCBbXTtcbiAgICB0aGlzLl9zb3J0ZWQgPSBudWxsO1xuXG4gICAgaWYgKGRlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnNldChuYW1lLCB2YWx1ZU9yVXBkYXRlRm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXliZVVwZGF0ZSh0aGlzLl92YXJzW25hbWVdKTtcbiAgICB9XG4gIH1cblxuICAvLyBHZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHZhcmlhYmxlIG5hbWVkIGBuYW1lYC5cbiAgZ2V0KG5hbWUpIHtcbiAgICB0aGlzLl9hc3NlcnREZWZpbmVkKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLl92YWx1ZXNbbmFtZV07XG4gIH1cblxuICAvLyBTZXQgdGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZSBuYW1lZCBgbmFtZWAgdG8gYHZhbHVlYC5cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5fYXNzZXJ0RGVmaW5lZChuYW1lKTtcbiAgICB0aGlzLl92YWx1ZXNbbmFtZV0gPSB2YWx1ZTtcbiAgICB0aGlzLl9zb3J0ZWRWYXJzKCkuZm9yRWFjaCh2ID0+IHRoaXMuX21heWJlVXBkYXRlKHYpKTtcbiAgfVxufVxuXG4vLyBFeHBvcnRzXG4vLyAtLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0gR3JhcGg7XG4iXX0=
