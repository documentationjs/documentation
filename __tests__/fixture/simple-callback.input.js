/**
 * This takes a number and a callback and calls the callback with the number
 * plus 3.
 *
 * @param {Number} n - The number.
 * @param {simpleCallback} cb - The callback.
 */
function takesSimpleCallback(n, cb) {
  cb(null, n + 3);
}

/**
 * This callback takes an error and a number.
 *
 * @callback simpleCallback
 * @param {?Error} err - The error.
 * @param {Number} n - The number.
 */
