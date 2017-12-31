
declare module '@documentation/core' {



  declare class DocumentationEngine {

  }


  declare interface FileParser {

  }

  declare interface ParserConfig {
    handlers: {
      [key: string]: FileParser
    }
  }

  declare class PluginManager {

  }

}