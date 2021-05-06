const path = require('path');
const config = require('../../src/config');
const mergeConfig = require('../../src/merge_config');

describe('single config tests', function () {
  beforeEach(function () {
    config.reset();
  });

  test('Should be failed on bad config', async function () {
    try {
      await mergeConfig({ config: 'DOES-NOT-EXIST' });
    } catch (err) {
      expect(err).toBeTruthy();
      return;
    }
    return Promise.reject(new Error('should be failed on bad config'));
  });

  test('right merging package configuration', async function () {
    const list = [
      'config',
      'no-package',
      'parseExtension',
      'project-homepage',
      'project-version',
      'project-description'
    ];
    await mergeConfig({
      config: path.join(__dirname, '../config_fixture/config.json'),
      'no-package': true,
      'project-name': 'cool Documentation'
    });

    const res = config.globalConfig;
    list.forEach(key => delete res[key]);
    expect(res).toEqual({
      'project-name': 'cool Documentation',
      foo: 'bar'
    });
  });

  const list = [
    'config',
    'no-package',
    'parseExtension',
    'project-homepage',
    'project-name',
    'project-version',
    'project-description'
  ];

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
      {
        config: path.join(__dirname, '../config_fixture/config_links.yml')
      },
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
  ].forEach((pair, index) => {
    test(`nc(mergeConfig) ${index}`, async function () {
      await mergeConfig(Object.assign(pair[0], { 'no-package': true }));
      const res = config.globalConfig;
      list.forEach(key => delete res[key]);
      expect(res).toEqual(pair[1]);
    });
  });
});
