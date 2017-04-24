// Options: {"documentExported": true}

export class Class {
  constructor(a: string) {}
  classMethod() {}
  get classGetter() {}
  set classSetter(v) {}
  static staticMethod() {}
  static get staticGetter() {}
  static set staticSetter(v) {}
}

export var object = {
  method() {},
  get getter() {},
  set setter(v) {},
  prop: 42,
  func: function() {}
};

/** Should not document this */
class NotExportedClass {
  /** Should not document this */
  classMethod() {}
  /** Should not document this */
  get classGetter() {}
  /** Should not document this */
  set classSetter(v) {}
  /** Should not document this */
  static staticMethod() {}
  /** Should not document this */
  static get staticGetter() {}
  /** Should not document this */
  static set staticSetter(v) {}
}

/** Should not document this */
var notExportedObject = {
  /** Should not document this */
  method() {},
  /** Should not document this */
  get getter() {},
  /** Should not document this */
  set setter(v) {},
  /** Should not document this */
  prop: 42,
  /** Should not document this */
  func: function() {}
};

export { x, y3 as y4 } from './document-exported/x';
export z from './document-exported/z.js';
export y2Default from './document-exported/y.js';

function f1() {}
function f2() {}

export { f1, f2 as f3 };

export type T = number;
type T2 = string;
type T3 = string;

export type { T2, T3 as T4 };

export type { T5 } from './document-exported/x.js';

export var f4 = function(x: X) {};

export { f5 };

export var o1 = {
  om1() {}
};

/** f5 comment */
var f5 = function(y: Y) {},
  o2 = {
    om2() {}
  };
export { o2 };
