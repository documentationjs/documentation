// @flow

/*::
type Foo = {
  foo: number,
  bar: boolean,
  baz: string
};
*/

class MyClass {
  /*:: prop: Foo; */

  method(value /*: Foo */) /*: boolean */ {
    return value.bar;
  }
}
