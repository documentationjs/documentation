/**
 * This is my component. This is from issue #458
 */
class Foo extends React.Component {}

/**
 * Does nothing. This is from issue #556
 */
export default class Bar {

    /**
     * Creates a new instance
     * @param {string} str
     */
    constructor(str) {
        /**
         * A useless property
         * @type {string}
         */
        this.bar = "";
    }
}
