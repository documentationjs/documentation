// @flow

declare module 'documentation-core' {

  declare type ParserConfig = {
    foo: String,
  }


  declare interface Plugin {}

  declare type PluginFactory = () => Plugin;

  declare type PluginHook =
    | 'onPrepareSourceFilesList'
    | 'onConfigureParser'


  // declare type OutputFormatter = (comments: Array<Comment>, outputConfig) => Promise<Array<File>|String>;

  declare class FormatterStream {

  }


  declare class ParserStream extends ReadableStream {
    format (): FormatterStream;
    then (): Promise<FormatterStream>;
    catch (): void;
  }

}