var path = require('path'),
  _ = require('lodash'),
  mergeConfig = require('../../src/merge_config');

test('bad config', async function() {
  try {
    await mergeConfig({ config: 'DOES-NOT-EXIST' });
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

test('right merging package configuration', async function() {
  // Omit configuration from output, for simplicity
  var nc = _.curryRight(_.omit, 2)([
    'config',
    'no-package',
    'parseExtension',
    'project-homepage',
    'project-version'
  ]);
  return mergeConfig({
    config: path.join(__dirname, '../config_fixture/config.json'),
    'no-package': true,
    'project-name': 'cool Documentation'
  })
    .then(nc)
    .then(res => {
      expect(res).toEqual({
        'project-name': 'cool Documentation',
        foo: 'bar'
      });
    });
});

test('nc(mergeConfig)', async function() {
  // Omit configuration from output, for simplicity
  var nc = _.curryRight(_.omit, 2)([
    'config',
    'no-package',
    'parseExtension',
    'project-homepage',
    'project-name',
    'project-version'
  ]);

  return Promise.all(
    [
      [
        { config: path.join(__dirname, '../config_fixture/config.json') },
        { foo: 'bar' }
      ],
      [
        {
          passThrough: true,
          config: path.join(__dirname, '../config_fixture/config.json')
        },
        { foo: 'bar', passThrough: true }
      ],
      [
        {
          config: path.join(__dirname, '../config_fixture/config_comments.json')
        },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config.yaml') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config.yml') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config_links.yml') },
        { foo: 'hello [link](https://github.com/my/link) world' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config_file.yml') },
        {
          toc: [
            {
              name: 'snowflake',
              file: path.join(__dirname, '../fixture/snowflake.md')
            }
          ]
        }
      ]
    ].map(pair =>
      mergeConfig(Object.assign(pair[0], { 'no-package': true }))
        .then(nc)
        .then(res => {
          expect(res).toEqual(pair[1]);
        })
    )
  );
});
