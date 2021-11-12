import path from 'path';
import { readFile } from 'fs/promises';
let vuecompiler = null;
let vueVersion = 'v3';

async function vueParser(source) {
  if (!vuecompiler) {
    try {
      vuecompiler = await import('@vue/compiler-sfc');
    } catch {
      try {
        vuecompiler = await import('vue-template-compiler');
        vueVersion = 'v2';
      } catch (err) {
        console.error(
          'You need to load package vue-template-compiler for Vue 2 or @vue/compiler-sfc for Vue 3'
        );
        throw err;
      }
    }
  }

  let component = {};
  if (vueVersion === 'v3') {
    component = vuecompiler.parse(source).descriptor;
  } else {
    component = vuecompiler.parseComponent(source);
  }

  return component.script?.content || '';
}

export default async function readFileCode(file) {
  let source = await readFile(file, {
    encoding: 'utf8'
  });

  if (path.extname(file) === '.vue') {
    source = await vueParser(source);
  }
  return source;
}
