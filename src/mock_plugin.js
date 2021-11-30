let initCb, parseCb, depCb, dummy;

export function mockInit(init, parse, dep) {
  initCb = init;
  parseCb = parse;
  depCb = dep;
}

export async function init() {
  if (initCb) initCb(...arguments);
  dummy = [
    {
      after: '',
      api: false,
      start: 0,
      end: 19,
      type: 'CommentBlock',
      value: '*\n * @method dummy\n ',
      context: {
        file: 'plugin.txt',
        loc: { start: { line: 5, column: 1 }, end: { line: 5, column: 4 } }
      },
      loc: { start: { line: 0, column: 1 }, end: { line: 2, column: 1 } },
      augments: [],
      errors: [],
      examples: [],
      implements: [],
      params: [],
      properties: [],
      returns: [],
      sees: [],
      tags: [],
      throws: [],
      todos: [],
      yields: []
    }
  ];
}

export function parse(file) {
  if (parseCb) parseCb(...arguments);
  if (file.file.includes('plugin.txt')) return dummy;
  return false;
}

export function shallow(file) {
  if (depCb) depCb(...arguments);
  if (file.includes('plugin.txt')) return true;
  return false;
}
