'use strict';

var Graph = require('..');
var test = require('tape');

test('simple', function(t) {
  var g = new Graph();
  g.define('a', [], 3);
  g.define('b', ['a'], a => a + 1);
  t.equal(g.get('b'), 4, 'variable has a value after define()');
  g.set('a', 10);
  t.equal(g.get('a'), 10);
  t.equal(g.get('b'), 11, 'dependency updated after set()');

  g.define('c', ['b'], b => b + 100);
  t.equal(g.get('c'), 111);
  g.set('a', 98);
  t.equal(g.get('c'), 199, 'transitive dependency');

  t.end();
});

test('multiple depedencies', function(t) {
  var g = new Graph();
  var updateCount = 0;

  g.define('a', [], 5);
  g.define('b', [], 7);
  g.define('c', ['a', 'b'], (a, b) => {
    updateCount++;
    return a + b;
  });
  t.equal(g.get('c'), 12);
  t.equal(updateCount, 1);

  g.set('a', 0);
  t.equal(g.get('c'), 7);
  t.equal(updateCount, 2);

  g.set('b', 1);
  t.equal(g.get('c'), 1);
  t.equal(updateCount, 3);

  t.end();
});

test('joined dependencies', function(t) {
  var g = new Graph();
  var updateCount = 0;

  g.define('a', [], 1);
  g.define('b', ['a'], a => a + 1);
  g.define('c', ['a', 'b'], (a, b) => {
    updateCount++;
    return a + b;
  });
  t.equal(g.get('c'), 3);
  t.equal(updateCount, 1);
  g.set('a', 5);
  t.equal(g.get('c'), 11);
  t.equal(updateCount, 2, 'only one update happens');

  t.end();
});

test('out of order definition', function(t) {
  var g = new Graph();
  var updateCount = 0;

  g.define('b', ['a'], a => {
    updateCount++;
    return a + 1;
  });
  t.equal(updateCount, 0);
  t.equal(g.get('b'), undefined);

  g.define('a', [], 1);
  t.equal(g.get('b'), 2);

  t.end();
});
