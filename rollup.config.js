// import { readFileSync } from 'fs';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
var banner = ''; /*readFileSync( 'src/banner.js', 'utf-8' )
	.replace( '${version}', pkg.version )
	.replace( '${time}', new Date() )
        .replace( '${commitHash}', commitHash ); */

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [['flow']],
      plugins: ['external-helpers']
    }),

    nodeResolve({
      jsnext: true
    })
  ],
  external: ['fs', 'path'],
  banner: banner,
  sourceMap: true,
  moduleName: 'rollup',
  targets: [{ dest: 'lib/documentation.js', format: 'cjs' }]
};
