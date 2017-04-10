/** Attempt to establish a cookie-based session in exchange for credentials.
 *  @function
 *  @name sessions.create
 *  @param {object} credentials
 *  @param {string} credentials.name        Login username. Also accepted as `username` or `email`.
 *  @param {string} credentials.password    Login password
 *  @param {function} [callback]            Gets passed `(err, { success:Boolean })`.
 *  @returns {Promise} promise, to be resolved on success or rejected on failure
 */
sessions.addMethod('create', 'POST / form', {
  // normalize request body params
  before({ body }) {}
});
