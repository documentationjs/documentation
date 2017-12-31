const
  fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  split2 = require('split2'),
  TransformStream = require('stream').Transform;

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

const dirs = getDirectories( path.join(__dirname,'..','packages') );


const watch = process.argv.indexOf('--watch') > -1;


class LineLabeller extends TransformStream {
  constructor (label) {
    super();

    this._label = '['+label+']  ';
  }
  _transform (buf, enc, cb) {
    try {
      this.push(new Buffer(this._label + buf.toString(), 'utf8'));
      cb();
    } catch (err) {
      cb(err);
    }
  }
}


function namedLines (label) {
  return split2()
    .pipe( new LineLabeller(label));
}


class RedString extends TransformStream {
  _transform (buf, enc, cb) {
    this.push( new Buffer('\\033[31m;'+buf.toString(), 'utf8'))
    cb();
  }
}




const processes = dirs.map( dir => {

  const label = dir.split('/').pop();

  const child = spawn('yarn',['build', watch?'--watch':null, '--color', '--ansi', ], {
    cwd: dir,
    env: process.env,
    shell: true,
    stdio: ['ignore','pipe','pipe']
  })

  child.stdout
    .pipe(namedLines(label))
    .pipe(process.stdout);

  child.stderr
    .pipe(namedLines(label))
    .pipe(new RedString())
    .pipe(process.stderr);

  return child;
})


