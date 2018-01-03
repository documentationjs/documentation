// @flow

const
  fs = require('fs-extra'),
  vfs = require('vinyl-fs'),
  path = require('path'),
  utils = require('@documentation/output-utils');


const createFilesystemOutput = (config) => async (files: Array<File>) => {

  if(!config.dir){
    throw new Error("No `config.dir` output directory specified in config");
  }

  // Create the output directory if it doesnt exist
  await fs.ensureDir(config.dir);

  return utils.streamArray(files)
    .pipe(vfs.dest(config.dir))

}

module.exports = createFilesystemOutput;