// Options: {"documentExported": true}

export class Class {
  classMethod() {}
  get classGetter() {}
  set classSetter(v) {}
  static staticMethod() {}
  static get staticGetter() {}
  static set staticSetter(v) {}
}

export var object =  {
  method() {},
  get getter() {},
  set setter(v) {},
  prop: 42,
  func: function() {},
};

class NotExportedClass {
  classMethod() {}
  get classGetter() {}
  set classSetter(v) {}
  static staticMethod() {}
  static get staticGetter() {}
  static set staticSetter(v) {}
}

var notExportedObject =  {
  method() {},
  get getter() {},
  set setter(v) {},
  prop: 42,
  func: function() {},
};
