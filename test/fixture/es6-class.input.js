/**
 * This is my component. This is from issue #458
 */
class Foo extends React.Component {}

/**
 * Does nothing. This is from issue #556
 * @param {string} str
 */
export class Bar {
  constructor(str) {
    /**
     * A useless property
     * @type {string}
     */
    this.bar = '';
  }
}

/**
 * This class has fully inferred constructor parameters.
 */
export class Baz {
  constructor(n: number, l: Array<string>) {}
}
