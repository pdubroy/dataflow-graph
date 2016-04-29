// Copyright (c) 2016 Patrick Dubroy <pdubroy@gmail.com>
// This software is distributed under the terms of the MIT License.

'use strict';

let assert = require('assert');

// Helpers
// -------

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
      assert.equal(countKeys(edgesIn[rootName]), 0, 'no edges in');

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
  assert.equal(sorted.length, varArray.length, 'no cycle');
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

  _sortedVars() {
    if (!this._sorted) {
      this._sorted = toposort(this._vars, this._edgesOut);
    }
    return this._sorted;
  }

  _update(v) {
    if (typeof v.update === 'function') {
      let args = v.edgesIn.map(varName => this._values[varName]);
      this._values[v.name] = v.update.apply(null, args);
    } else if (!(v.name in this._values)) {
      this._values[v.name] = v.update;
    }
  }

  // Define a new variable named `name`.
  // `deps` is an Array of variable names that the new variable depends on.
  // `valueOrUpdateFn` is either an update function (having the same arity as
  // `deps`) or, if `deps` is empty, the initial value for the variable.
  define(name, deps, valueOrUpdateFn) {
    assert(!(name in this._vars), false, 'already defined');
    this._vars[name] = {
      name: name,
      edgesIn: deps,
      update: valueOrUpdateFn
    };
    deps.forEach(depName => this._addEdge(depName, name));
    this._edgesOut[name] = this._edgesOut[name] || [];
    this._sorted = null;
    this._update(this._vars[name]);
  }

  // Get the current value of the variable named `name`.
  get(name) {
    return this._values[name];
  }

  // Set the value of the variable named `name` to `value`.
  set(name, value) {
    this._values[name] = value;
    this._sortedVars().forEach(v => this._update(v));
  }

}

// Exports
// -------

module.exports = Graph;
