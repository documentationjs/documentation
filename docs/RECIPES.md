## Classes

ES6 has a nice, formal way of declaring classes. documentation.js handles it well:
here are tips for dealing with them.

**Document constructor parameters with the class, not the constructor method.**

Do:

```js
/**
 * A table object
 * @param {number} width
 * @param {number} height
 */
class Table {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}
```

Don't:

```js
/** A table object */
class Table {
  /*
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}
```

## Class factories: using `@lends`

Many libraries and frameworks have special 'class constructor methods' that
accept an object as an input and return a class with that object's properties
as prototype properties. For instance, Dojo has `define`, React has `React.createClass`,
Ext has `Ext.define`.

documentation.js can't assume that a method receiving an object will return a class,
since many methods don't. Luckily, you can indicate this to the tool with the `@lends`
tag.

For instance in a Dojo-style instantiation:

```js
/**
 * This is the documentation for the created class, a SelectionEngine
 */
const SelectionEngine = declare(
  null,
  /** @lends SelectionEngine */ {
    /**
     * This method will be parsed as SelectionEngine.expandColsTo
     * because the object that contains it has a @lends tag indicating
     * that it will be lended to the SelectionEngine prototype.
     */
    expandColsTo: function(foo, bar, baz) {}
  }
);
```

The mechanics are:

* If you're creating a kind of class with a helper function
* And you provide an object of properties that will be mixed in to the class
  as one of the arguments to that function
* Add a tag like `/** @lends ClassName */` before that object, and the properties
  in the object will be correctly assigned to the class's prototype.

## Destructuring Parameters

In ES6, you can use [destructuring assignment in functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):
this lets you quickly write functions that use only some properties of an object.
For instance:

```js
function addTheXandYProperties({ x, y }) {
    return x + y;
}
```

Destructured parameters are **unnamed** in the code: while we have names
for x & y, the function doesn't declare what it will call the object you
call this function with. So you must name the parent object of
destructured parameters to document them in documentation.js.

So, if you want to add more detailed documentation for properties
within destructured params, name the parent object, then prefix property
names with the parent object. Here's an example:

```js
/**
 * This method has hierarchical params
 * @param {Object} animals different kinds of animals
 * @param {String} animals.fishes number of kinds of fish
 */
function fishesAndFoxes({ fishes, foxes }) {
  return fishes + foxes;
}
```

Note: documentation.js used to implicitly call those parent objects
`$0`, `$1`, etc. Starting in documentation.js 4.0.0-rc.1 the more
explicit syntax is required.

## Object Factories

Libraries like [d3](https://d3js.org) eschew JavaScript's `new` operator
in favor of the ['object factory' or 'module pattern'](https://macwright.org/2012/06/04/the-module-pattern.html).

The factory function is a normal function that yields an object. That object
has properties. In this case, we don't use the `@class` tag because
we don't use the `new` operator or modify any object's `prototype`.

```js
/**
 * area chart generator
 * @returns {chart}
 */
var area = function() {
  /**
   * Run a chart over a given selection
   * @param {Selection} selection
   */
  var chart = function(selection) {
  };
  /**
   * Sets the chart data.
   */
  chart.data = function(_) {
  };
  return chart;
};
```

## Overloaded Methods

Also common in [jQuery](https://jquery.com/), [d3](http://d3js.org/),
and concise JavaScript libraries are getter-setter methods, where you might
call `thing.size()` to get a thing's size and `thing.size(10)` to set a thing's
size to 10.

The best way to document these kinds of methods is by doing it twice:

```js
var theTime;
/**
 * Get the time
 * @returns {Date} the current date
 */
/**
 * Set the time
 * @param {Date} time the current time
 * @returns {undefined} nothing
 */
function getTheTime(time) {
  if (arguments.length === 0) {
    return new Date();
  } else {
    theTime = time;
  }
}
```

The first documentation describes how you can call getTheTime without
any arguments, and the second describes how you can call getTheTime with
an argument. `documentation` will output two documented functions when you
use this style.

## Promises

Promises have become a widely used feature in modern JavaScript. They are
documented in a similar manner to arrays:

```js
/**
 * Find a person's phone number in the database
 * @param {string} name person's name
 * @returns {Promise<string>} promise with the phone number
 */
function findPersonAge(name) {
  return new Promise((resolve, reject) => {
    db.find({ name: name })
    .then(object => resolve(object.age))
    .catch(err => reject(err))
  })
}
```

Multiple parameters within the `resolve` can be documented like so: `Promise<string, number>`.
