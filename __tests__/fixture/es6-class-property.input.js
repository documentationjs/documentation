/**
 * This is for issue 906.
 */
export class Issue906 {
  /**
   * This is a read-write property.
   * @type {boolean}
   */
  get readWriteProp() {
    return this._rw;
  }

  set readWriteProp(value) {
    this._rw = value;
  }

  /**
   * This is a read-only property.
   * @type {string}
   * @readonly
   */
  get readOnlyProp() {
    return 'foo';
  }
}
