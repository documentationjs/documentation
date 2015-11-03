# GeoJSONSource

Create a GeoJSON data source instance given an options object

**Parameters**

-   `options` **[Object]** optional options
    -   `options.data` **Object or string** A GeoJSON data object or URL to it.
        The latter is preferable in case of large GeoJSON files.

    -   `options.maxzoom` **[number]** Maximum zoom to preserve detail at.
         (optional, default `14`)
    -   `options.buffer` **[number]** Tile buffer on each side.

    -   `options.tolerance` **[number]** Simplification tolerance (higher means simpler).

