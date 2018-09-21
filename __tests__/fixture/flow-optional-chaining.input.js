// @flow

/** foo */
const foo: { prop1?: { prop2?: string } } = { prop1: { prop2: 'value' } };
/** value */
const value = foo?.prop1?.prop2;
