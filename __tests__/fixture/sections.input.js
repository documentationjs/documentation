/**
 * This function is first
 */
function first() {}

/** */
class AClass {
  /**
   * forgot a memberof here... sure hope that doesn't crash anything!
   * @method first
   */
  first(x, y) {}

  /**
   * shares a name with a top level item referenced in the TOC... sure hope
   * that doesn't crash anything!
   */
  second() {}
}

/**
 * This class has some members
 */
function second() {}

/**
 * second::foo
 */
second.prototype.foo = function(pork) {};

/**
 * second::bar
 */
second.prototype.bar = function(beans, rice) {};

/**
 * This function is third
 */
function third() {}
