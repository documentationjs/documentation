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
