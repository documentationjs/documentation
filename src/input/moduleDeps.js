import path from 'path';
import util from 'util';
import r from 'resolve';
import readFileCode from './readFileCode.js';
import konan from 'konan';
import { parseToAst } from '../parsers/parse_to_ast.js';

// const parseExst = ['.js', '.mjs', '.jsx', '.vue', '.ts', '.tsx'];
const resolveExst = ['.json', '.css', '.less', '.sass'];
const resolve = util.promisify(r);

class Deps {
  constructor(opts = {}) {
    this.fileCache = opts.fileCache || {};
    this.visited = {};
    this.res = [];

    this.options = { ...opts };
  }

  async flush(input) {
    const promises = input.map(file => {
      const dir = path.dirname(file);
      return this.walk(file, {
        basedir: dir,
        filename: 'root'
      });
    });
    await Promise.all(promises);

    return this.res;
  }

  async readFile(file) {
    if (this.fileCache[file]) {
      return this.fileCache[file];
    }

    return readFileCode(file);
  }

  async walk(id, parent) {
    const extensions = this.options.extensions;
    const sortKey = parent.sortKey || '';
    let file = null;

    try {
      file = await resolve(id, { ...parent, extensions });
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        console.warn(`module not found: "${id}" from file ${parent.filename}`);
        return;
      }
      throw err;
    }

    if (this.visited[file] || resolveExst.includes(path.extname(file))) {
      return file;
    }
    this.visited[file] = true;

    const source = await this.readFile(file);
    const depsArray = this.parseDeps(file, source);
    if (!depsArray) {
      return file;
    }

    const deps = {};
    const promises = depsArray.map(async (id, i) => {
      const filter = this.options.filter;
      if (filter && !filter(id)) {
        deps[id] = false;
        return;
      }
      const number = i.toString().padStart(8, '0');
      deps[id] = await this.walk(id, {
        filename: file,
        basedir: path.dirname(file),
        sortKey: sortKey + '!' + file + ':' + number
      });
    });

    await Promise.all(promises);

    this.res.push({
      id: file,
      source,
      deps,
      file,
      sortKey: sortKey + '!' + file
    });
    return file;
  }

  parseDeps(file, src) {
    try {
      const ast = parseToAst(src, file);
      return konan(ast).strings;
    } catch (ex) {
      console.error(`Parsing file ${file}: ${ex}`);
    }
  }
}

export default async function (input = [], opts = {}) {
  const dep = new Deps(opts);
  return dep.flush(Array.from(new Set(input)));
}
