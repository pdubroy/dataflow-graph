'use strict';

var Graph = require('..');
var test = require('tape');

test('basic', function(t) {
  var g = new Graph();
  g.define('a', [], 3);
  g.define('b', ['a'], function(a) {
    return a + 1;
  });
  t.equal(g.get('b'), 4);
  g.set('a', 10);
  t.equal(g.get('a'), 10);
  t.equal(g.get('b'), 11);

  t.end();
});
