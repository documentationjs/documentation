const path = require('path');
const exec = require('child_process').exec;
const tmp = require('tmp');
const fs = require('fs-extra');

function documentation(args, options, parseJSON) {
  return new Promise((resolve, reject) => {
    if (!options.cwd) {
      options.cwd = __dirname;
    }

    options.maxBuffer = 1024 * 1024;

    args.unshift(
      'node ' + path.join(__dirname, '..', 'bin', 'documentation.js')
    );

    exec(args.join(' '), options, (err, res) => {
      resolve(res);
    });
  });
}

describe('readme autodetection of different filenames', function () {
  const fixtures = path.join(__dirname, 'fixture/readme');
  const sourceFile = path.join(fixtures, 'index.js');
  let d;
  let removeCallback;

  beforeEach(() => {
    const dirEntry = tmp.dirSync({ unsafeCleanup: true });
    d = dirEntry.name;
    fs.copySync(
      path.join(fixtures, 'README.input.md'),
      path.join(d, 'readme.markdown')
    );
    fs.copySync(path.join(fixtures, 'index.js'), path.join(d, 'index.js'));
  });

  test('updates readme.markdown', async function () {
    await documentation(['readme index.js -s API'], { cwd: d });
    const outputPath = path.join(d, 'readme.markdown');
    expect(fs.readFileSync(outputPath, 'utf-8')).toMatchSnapshot();
  });
});

describe('readme command', function () {
  const fixtures = path.join(__dirname, 'fixture/readme');
  const sourceFile = path.join(fixtures, 'index.js');
  let d;
  let removeCallback;

  beforeEach(() => {
    const dirEntry = tmp.dirSync({ unsafeCleanup: true });
    d = dirEntry.name;
    fs.copySync(
      path.join(fixtures, 'README.input.md'),
      path.join(d, 'README.md')
    );
    fs.copySync(path.join(fixtures, 'index.js'), path.join(d, 'index.js'));
  });

  // run tests after setting up temp dir

  test('--diff-only: changes needed', async function () {
    const before = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
    try {
      await documentation(['readme index.js --diff-only -s API'], {
        cwd: d
      });
    } catch (err) {
      const after = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
      expect(err).toBeTruthy();
      expect(err.code).not.toBe(0);
      expect(after).toEqual(before);
    }
  });

  test('updates README.md', async function () {
    await documentation(['readme index.js -s API'], { cwd: d });
    const outputPath = path.join(d, 'README.md');
    expect(fs.readFileSync(outputPath, 'utf-8')).toMatchSnapshot();
  });

  test('--readme-file', async function () {
    fs.copySync(
      path.join(fixtures, 'README.input.md'),
      path.join(d, 'other.md')
    );
    await documentation(['readme index.js -s API --readme-file other.md'], {
      cwd: d
    });
    const actual = fs.readFileSync(path.join(d, 'other.md'), 'utf8');
    expect(actual).toMatchSnapshot();
  });

  test('--diff-only: changes NOT needed', function () {
    fs.copySync(
      path.join(fixtures, 'README.output.md'),
      path.join(d, 'uptodate.md')
    );
    return documentation(
      ['readme index.js --diff-only -s API --readme-file uptodate.md'],
      { cwd: d }
    ).then(stdout => {
      // t.match(stdout, 'is up to date.');
    });
  });

  test('-s: not found', async function () {
    fs.copySync(
      path.join(fixtures, 'README.output.md'),
      path.join(d, 'uptodate.md')
    );
    try {
      await documentation(
        ['readme index.js --diff-only -s NOTFOUND --readme-file uptodate.md'],
        { cwd: d }
      );
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('requires -s option', async function () {
    try {
      await documentation(['readme index.js'], { cwd: d });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
      expect(err.stderr.match(/Missing required argument/)).toBeTruthy();
    }
  });

  const badFixturePath = path.join(__dirname, 'fixture/bad/syntax.input');
  test('errors on invalid syntax', async function () {
    try {
      await documentation(
        ['readme ' + badFixturePath + ' -s API --parseExtension input'],
        { cwd: d }
      );
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
    }
  });
});
