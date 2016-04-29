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
  // Supports two signatures:
  //   define(name, deps, updateFn), and
  //   define(name, value)
  define(name, ...args) {
    let valueOrUpdateFn = args[args.length - 1];
    let deps = args.length > 1 ? args[0] : [];

    assert(!(name in this._vars),
           "variable '" + name + "' is already defined");
    this._vars[name] = {
      name: name,
      edgesIn: deps,
      update: deps.length > 0 ? valueOrUpdateFn : null
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
