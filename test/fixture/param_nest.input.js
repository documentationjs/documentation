/**
 * Create a GeoJSON data source instance given an options object
 * @class GeoJSONSource
 * @param {Object} [options] optional options
 * @param {Object|string} options.data A GeoJSON data object or URL to it.
 * The latter is preferable in case of large GeoJSON files.
 * @param {number} [options.maxzoom=14] Maximum zoom to preserve detail at.
 * @param {number} [options.buffer] Tile buffer on each side.
 * @param {number} [options.tolerance] Simplification tolerance (higher means simpler).
 */
function GeoJSONSource(options) {
  this.options = options;
}
