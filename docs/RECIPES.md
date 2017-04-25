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

Destructured parameters are **unnamed**: while we have names for x & y,
the function doesn't declare what it will call the object you call
this function with. So documentation.js names your destructured parameters
for you: if the param is the first, it'll call it `$0`, if second, `$1`,
and so on.

So, if you want to add more detailed documentation for properties
within destructured params, prefix property names with $0 for the object,
or $1 if it's the second parameter, and so on - the number is the position
of the destructuring parameter within the list of parameters. Here's
an example:

```js
/**
 * This method has partially inferred params
 * @param {String} $0.fishes number of kinds of fish
 */
function fishesAndFoxes({ fishes, foxes }) {
  return fishes + foxes;
}
```

## Object Factories

Libraries like [d3](http://d3js.org/) eschew JavaScript's `new` operator
in favor of the ['object factory' or 'module pattern'](http://www.macwright.org/2012/06/04/the-module-pattern.html).

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
