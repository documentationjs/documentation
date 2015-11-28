# GeoJSONSource

Create a GeoJSON data source instance given an options object

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=** optional options
    -   `options.data` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)|[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** A GeoJSON data object or URL to it.
        The latter is preferable in case of large GeoJSON files.
    -   `options.maxzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Maximum zoom to preserve detail at. (optional, default `14`)
    -   `options.buffer` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Tile buffer on each side.
    -   `options.tolerance` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Simplification tolerance (higher means simpler).
