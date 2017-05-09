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
