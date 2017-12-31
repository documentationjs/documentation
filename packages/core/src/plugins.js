
module.exports = class PluginManager {

  /**
   * @private
   */
  _registered: Set<Plugin>


  constructor () {
    this._registered = new Set();
  }


  add (plugin: Plugin) {
    this._registered.add(plugin);
  }


  async dispatch<T>( hook: string, arg: T, ...args: Array<any>): Promise<T> {
    let retArg = arg;
    for(const plugin of this._registered) {
      if( plugin::_implements(hook) ){
        retArg = await plugin[hook](retArg,...args);
      }
    }
    return retArg;
  }



}


/**
 *
 * @private
 * @memberof Plugin
 * @param {string} hook
 */
function _implements (hook: string): boolean {
  return Object.keys(this).indexOf(hook) > -1;
}