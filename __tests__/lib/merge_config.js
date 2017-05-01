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

test('nc(mergeConfig)', function(done) {
  // Omit configuration from output, for simplicity
  var nc = _.curryRight(_.omit, 2)([
    'config',
    'no-package',
    'parseExtension',
    'project-homepage',
    'project-name',
    'project-version'
  ]);

  Promise.all(
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
  ).then(res => {
    done();
  });
});
