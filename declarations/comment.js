declare type DocumentationConfig = {
  polyglot?: boolean,
  inferPrivate?: boolean,
  noPackage?: boolean,
  toc?: Array<Object>,
  paths?: { [key: string]: number },
  defaultGlobals?: boolean,
  defaultGlobalsEnvs?: Array<string>,
  external?: Array<string>,
  theme: string,
  requireExtension?: Array<string>,
  parseExtension: Array<string>
};

declare type InputsConfig = {
  inputs: Array<SourceFile>,
  config: DocumentationConfig
};

declare type CommentError = {
  message: string,
  commentLineNumber?: number
};

declare type DoctrineType = {
  elements?: Array<DoctrineType>,
  expression?: DoctrineType,
  applications?: Array<DoctrineType>,
  type: string,
  name?: string
};

declare type CommentLoc = {
  start: {
    line: number
  },
  end: {
    line: number
  }
};

declare type SourceFile = {
  source?: string,
  file: string
};

declare type CommentContext = {
  sortKey: string,
  file: string,
  ast: Object,
  loc: CommentLoc,
  code: string,
  github?: CommentContextGitHub
};

declare type CommentContextGitHub = {
  path: string,
  url: string
};

declare type CommentTag = {
  name?: string,
  title: string,
  description?: Object,
  default?: any,
  lineNumber?: number,
  type?: DoctrineType,
  properties?: Array<CommentTag>
};

declare type CommentMembers = {
  static: Array<Comment>,
  instance: Array<Comment>,
  events: Array<Comment>,
  global: Array<Comment>,
  inner: Array<Comment>
};

declare type CommentExample = {
  caption?: string,
  description?: Object
};

declare type Remark = {
  type: string,
  children: Array<Object>
};

declare type Access = 'private' | 'public' | 'protected';
declare type Scope = 'instance' | 'static' | 'inner' | 'global';
declare type Kind = 'class' |
  'constant' |
  'event' |
  'external' |
  'file' |
  'function' |
  'member' |
  'mixin' |
  'module' |
  'namespace' |
  'typedef' |
  'interface';

declare type Comment = {
  errors: Array<CommentError>,
  tags: Array<CommentTag>,

  augments: Array<CommentTag>,
  errors: Array<CommentExample>,
  examples: Array<CommentExample>,
  params: Array<CommentTag>,
  properties: Array<CommentTag>,
  returns: Array<CommentTag>,
  sees: Array<Remark>,
  throws: Array<CommentTag>,
  todos: Array<CommentTag>,

  description?: Remark,
  summary?: Remark,
  deprecated?: Remark,
  classdesc?: Remark,

  members: CommentMembers,

  name?: string,
  kind?: Kind,

  memberof?: string,
  scope?: Scope,
  access?: Access,
  alias?: string,

  copyright?: string,
  author?: string,
  license?: string,
  version?: string,
  since?: string,
  lends?: string,
  override?: boolean,

  type?: DoctrineType,

  context: CommentContext,

  path?: Array<{
    name: string,
    scope: Scope
  }>
};

declare type ReducedComment = {
  name: string,
  kind: ?Kind,
  scope?: ?Scope
}
