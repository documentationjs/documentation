/**
 * This function returns the number one.
 */
function addThem(a: Point, b: string, c: ?boolean, d: Array<number>, e: Object, f: Named): number {
  return a + b + c + d + e;
}

/**
 * A 2D point.
 *
 * @property {number} x this is a prop
 */
type Point = {
  x: number,
  y: number,
  rgb: {
    hex: string
  },
  props: {
    radius: {
      x: number
    }
  }
};

/**
 * A type with entirely derived properties
 */
type Two = {
  x: number,
  y: number
};

/**
 * Just an alias for an array of strings
 */
type T = Array<string>;

/**
 * Very Important Transform
 */
function veryImportantTransform(
  input: Array<string>,
  options: Object = {}
): string {
  return "42";
}
