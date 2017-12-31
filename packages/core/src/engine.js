// @flow

const
  fs = require('fs'),
  _ = require('lodash'),
  parseJsFile = require('@documentation/parser-js'),
  PluginManager = require('./plugins');


/**
 * Documentation Engine
 *
 *
 */
module.exports = class DocumentationEngine {

  _plugins: PluginManager;

  constructor () {
    this._plugins = new PluginManager();
  }


  /**
   *
   * @param {Plugin} plugin
   */
  use (plugin: Plugin) {
    this._plugins.add(plugin);
  }


  /**
   *
   * @param {Array<string>} entrypoints
   * @param {ParserConfig}  config
   */
  async parse ( entrypoints: Array<string>, config: ParserConfig ): Promise<Array<Comment>> {
    const preparedConfig = await this::_validateParserConfig(config);
    const preparedInputFiles = await this::_prepareInputFiles(entrypoints);

    const buildPipeline = (comment) => comment;

    let extractedComments = _.flatMap(
      preparedInputFiles.map(file => parseJsFile({file}, preparedConfig)))
       .filter(Boolean)
       .map(buildPipeline);
    return extractedComments;
  }


  /**
   *
   * @param {*} comments
   * @param {*} config
   */
  async format ( comments: Array<Comment>, formatter: CommentFormatter): Promise<Array<File>> {
    return await formatter(comments);
  }


  /**
   *
   * @param {*} files
   * @param {*} config
   */
  async output ( files: Array<File>, config: any): Promise<void> {

  }

}


/**
 *
 * @memberof DocumentationEngine
 * @param {ParserConfig} config
 */
async function _validateParserConfig (config: ParserConfig): Promise<Array<ParserConfig>> {
  // Allow plugins to modify config before it is validated
  // config = await this._plugins.dispatch('onPrepareParserConfig', config);

  // Do our core validation here

  // Allow plugins to do some additional validation if they wish
  // config = await this._plugins.dispatch('onValidateParserConfig', config);

  return config;
}


/**
 * Prepare a list of input files for parsing
 *
 * @param {Array<string>} inputFiles
 * @return {Promise<Array<string>>}
 */
async function _prepareInputFiles (inputFiles: Array<string>): Promise<Array<string>> {
  inputFiles = await this._plugins.dispatch('onDefineParserInputFiles', Array.from(inputFiles));

  return inputFiles;
}


async function _prepareBuildPipeline (): Promise<Array<Function>> {
  parsers = [

  ];

  return (comment) => {
    for(const parser of parsers) {
      comment = parser(comment);
    }
    return comment;
  }
}