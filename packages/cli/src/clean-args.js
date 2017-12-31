module.exports = function cleanArgv(argv, argConfig) {
  const args = {};
  Object.keys(argv)
    .filter(key => Object.keys(argConfig).indexOf(key) > -1)
    .forEach(key => {
      args[key] = argv[key];
    })
  return args;
}

