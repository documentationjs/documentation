// @flow

const
  fs = require('fs'),
  _ = require('lodash'),
  parseJsFile = require('@documentation/parser-js'),
  PluginManager = require('./plugins'),
  inferName = require('./infer/name'),
  inferKind = require('./infer/kind'),
  inferAugments = require('./infer/augments'),
  inferParams = require('./infer/params'),
  inferProperties = require('./infer/properties'),
  inferMembership = require('./infer/membership'),
  inferReturn = require('./infer/return'),
  inferAccess = require('./infer/access'),
  inferType = require('./infer/type'),
  github = require('./infer/github'),
  nest = require('./infer/nest'),
  garbageCollect = require('./infer/garbage_collect'),
  filterAccess = require('./js-parser/filter_access'),
  hierarchy = require('./js-parser/hierarchy'),
  sort = require('./js-parser/sort')
  ;


/**
 * Documentation Engine
 *
 *
 */
class DocumentationEngine {

  _plugins: PluginManager;

  constructor () {
    this._plugins = new PluginManager();
  }


  /**
   * Register a plugin that this engine should use.
   *
   * @param {Plugin} plugin The plugin to be registered
   * @returns {DocumentationEngine} (`this`)
   */
  use (plugin: Plugin): DocumentationEngine {
    this._plugins.add(plugin);
    return this;
  }


  /**
   *
   * @param {Array<string>} entrypoints
   * @param {ParserConfig}  config
   */
  async parse ( entrypoints: Array<string>, config: ParserConfig ): Promise<Array<Comment>> {
    const preparedConfig = await this::_validateParserConfig(config);
    const preparedInputFiles = await this::_prepareInputFiles(entrypoints);

    const buildPipeline = await this::_prepareBuildPipeline(config);

    let extractedComments = _.flatMap(
      preparedInputFiles.map(file => parseJsFile({file}, preparedConfig)))
        .filter(Boolean)
        .map(buildPipeline);

    return filterAccess(
      config.access,
      hierarchy(sort(extractedComments, config))
    );

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
  async output ( files: Array<File>, outputAdapter: Function): Promise<void> {
    return outputAdapter(files);
  }

}

module.exports = DocumentationEngine;


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


async function _prepareBuildPipeline (config: ParserConfig): Promise<Function> {
  const parsers = [
    inferName,
    inferAccess(config.inferPrivate),
    inferAugments,
    inferKind,
    nest,
    inferParams,
    inferProperties,
    inferReturn,
    inferMembership(),
    inferType,
    config.github ? github : undefined,
    garbageCollect
  ].filter(Boolean);



  return (comment) => {
    for(const parser of parsers) {
      comment = parser(comment);
    }
    return comment;
  }
}