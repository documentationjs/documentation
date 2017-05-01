var parse = require('../../../src/parsers/javascript'),
  inferMembership = require('../../../src/infer/membership')();

function toComment(fn, file) {
  return parse(
    {
      file,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  );
}

function pick(obj, props) {
  return props.reduce(function(memo, prop) {
    if (obj[prop] !== undefined) {
      memo[prop] = obj[prop];
    }
    return memo;
  }, {});
}

function evaluate(fn, file) {
  return toComment(fn, file).map(inferMembership);
}

function Foo() {}
function lend() {}

test('inferMembership - explicit', function() {
  expect(
    pick(
      evaluate(function() {
        /**
   * Test
   * @memberof Bar
   * @static
   */
        Foo.bar = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Bar',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        /**
   * Test
   * @memberof Bar#
   */
        Foo.bar = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Bar',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        /**
   * Test
   * @memberof Bar.prototype
   */
        Foo.bar = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Bar',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        /** Test */
        Foo.bar = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        /** Test */
        Foo.prototype.bar = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        /** Test */
        Foo.bar.baz = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo.bar',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        /** Test */
        (0).baz = 0;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({});

  expect(
    pick(
      evaluate(function() {
        Foo.bar = {
          /** Test */
          baz: 0
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo.bar',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        Foo.prototype = {
          /** Test */
          bar: 0
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  /* eslint object-shorthand: 0 */
  expect(
    pick(
      evaluate(function() {
        Foo.prototype = {
          /**
     * Test
     */
          bar: function() {}
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        Foo.prototype = {
          /**
     * Test
     */
          bar() {}
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        var Foo = {
          /** Test */
          baz: 0
        };
        return Foo;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        var Foo = {
          /** Test */
          baz: function() {}
        };
        return Foo;
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        function Foo() {
          {
            /** */
            this.bar = 0;
          }
        }
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        var Foo = function Bar() {
          {
            /** */
            this.baz = 0;
          }
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        class Foo {
          constructor() {
            {
              /** */
              this.bar = 0;
            }
          }
        }
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        /** Test */
        module.exports = function() {};
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'module',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        lend(
          /** @lends Foo */ {
            /** Test */
            bar: 0
          }
        );
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        lend(
          /** @lends Foo */ {
            /** Test */
            bar: function() {}
          }
        );
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'static'
  });

  expect(
    pick(
      evaluate(function() {
        lend(
          /** @lends Foo.prototype */ {
            /** Test */
            bar: 0
          }
        );
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(function() {
        lend(
          /** @lends Foo.prototype */ {
            /** Test */
            bar: function() {}
          }
        );
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });

  // t.deepEqual(pick(evaluate(function () {
  //   /** Foo */
  //   function Foo() {
  //     /** Test */
  //     function bar() {}
  //     return {
  //       bar: bar
  //     };
  //   }
  // })[1], ['memberof', 'scope']), {
  //   memberof: 'Foo',
  //   scope: 'static'
  // }, 'inferMembership - revealing, static, function');

  expect(
    evaluate(function() {
      lend(/** @lends Foo */ {});
      /** Test */
    })[0].memberof
  ).toBe(undefined);
});

test('inferMembership - exports', function() {
  expect(
    evaluate(function() {
      /** @module mod */
      /** foo */
      exports.foo = 1;
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /** @module mod */
      /** foo */
      exports.foo = function() {};
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /** @module mod */
      /** bar */
      exports.foo.bar = 1;
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      exports.foo = {
        /** bar */
        bar: 1
      };
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      exports.foo = {
        /** bar */
        bar() {}
      };
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      /** bar */
      exports.foo.prototype.bar = function() {};
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      exports.foo.prototype = {
        /** bar */
        bar() {}
      };
    })[1].memberof
  ).toBe('mod.foo');
});

test('inferMembership - module.exports', function() {
  expect(
    evaluate(function() {
      /** @module mod */
      /** foo */
      module.exports.foo = 1;
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /** @module mod */
      /** foo */
      module.exports.foo = function() {};
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /** @module mod */
      /** bar */
      module.exports.foo.bar = 1;
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      module.exports.foo = {
        /** bar */
        bar: 1
      };
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      module.exports.foo = {
        /** bar */
        bar() {}
      };
    })[1].memberof
  ).toBe('mod.foo');

  expect(
    evaluate(function() {
      /** @module mod */
      /** bar */
      module.exports.prototype.bar = function() {};
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /** @module mod */
      module.exports.prototype = {
        /** bar */
        bar() {}
      };
    })[1].memberof
  ).toBe('mod');

  expect(
    evaluate(function() {
      /**
   * @module mod
   * @name exports
   */
      module.exports = 1;
    })[0].memberof
  ).toBe(undefined);

  expect(
    evaluate(function() {
      /**
   * @module mod
   * @name exports
   */
      module.exports = function() {};
    })[0].memberof
  ).toBe(undefined);

  expect(
    evaluate(function() {
      /** @module mod */
      module.exports = {
        /** foo */
        foo: 1
      };
    })[1].memberof
  ).toBe('mod');
});

test('inferMembership - not module exports', function() {
  var result = evaluate(function() {
    /**
     * @module mod
     */
    /** Test */
    global.module.exports.foo = 1;
  }, '/path/mod.js');

  expect(result.length).toBe(2);
  expect(result[0].memberof).not.toBe('mod');
});

test('inferMembership - anonymous @module', function() {
  var result = evaluate(function() {
    /**
     * @module
     */
    /** Test */
    exports.foo = 1;
  }, '/path/mod.js');

  expect(result.length).toBe(2);
  expect(result[1].memberof).toBe('mod');
});

test('inferMembership - no @module', function() {
  var result = evaluate(function() {
    /** Test */
    exports.foo = 1;
  }, '/path/mod.js');

  expect(result.length).toBe(1);
  expect(result[0].memberof).toBe('mod');
});

test('inferMembership - https://github.com/documentationjs/documentation/issues/378', function() {
  expect(
    pick(
      evaluate(function() {
        Foo.prototype = {
          /** Test */
          bar() {
            lend();
            lend();
          }
        };
      })[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'Foo',
    scope: 'instance'
  });
});

test('inferMembership - export', function() {
  expect(
    pick(
      evaluate(
        'export default class {' + '  /** */' + '  method() {}' + '}',
        'test-file'
      )[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'test-file',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(
        'export default class C {' + '  /** */' + '  method() {}' + '}',
        'test-file'
      )[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'C',
    scope: 'instance'
  });

  expect(
    pick(
      evaluate(
        'export class C {' + '  /** */' + '  method() {}' + '}',
        'test-file'
      )[0],
      ['memberof', 'scope']
    )
  ).toEqual({
    memberof: 'C',
    scope: 'instance'
  });
});
