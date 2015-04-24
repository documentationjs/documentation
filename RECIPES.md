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
