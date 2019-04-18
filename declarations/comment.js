/* @flow */
/* eslint no-use-before-define: 0 */
type DocumentationConfig = {
  inferPrivate?: string,
  noPackage?: boolean,
  toc?: Array<Object>,
  paths?: { [key: string]: number },
  access?: Array<string>,
  defaultGlobals?: boolean,
  defaultGlobalsEnvs?: Array<string>,
  external?: Array<string>,
  theme: string,
  requireExtension?: Array<string>,
  parseExtension: Array<string>,
  noReferenceLinks?: boolean,
  markdownToc?: boolean,
  markdownTocMaxDepth?: number,
  documentExported?: boolean,
  resolve?: string,
  hljs?: Object
};

type CommentError = {
  message: string,
  commentLineNumber?: number
};

type DoctrineType = {
  elements?: Array<DoctrineType>,
  expression?: DoctrineType,
  applications?: Array<DoctrineType>,
  type: string,
  name?: string
};

type CommentLoc = {
  start: {
    line: number
  },
  end: {
    line: number
  }
};

type SourceFile = {
  source?: string,
  file: string
};

type CommentContext = {
  sortKey: string,
  file: string,
  ast?: Object,
  loc: CommentLoc,
  code: string,
  github?: CommentContextGitHub
};

type CommentContextGitHub = {
  path: string,
  url: string
};

type CommentTag = {
  name?: string,
  title: string,
  description?: Object,
  default?: any,
  lineNumber?: number,
  type?: DoctrineType,
  properties?: Array<CommentTag>,
  readonly?: boolean
};

type Comment = {
  errors: Array<CommentError>,
  tags: Array<CommentTag>,

  augments: Array<CommentTag>,
  examples: Array<CommentExample>,
  implements: Array<CommentTag>,
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
  constructorComment?: Comment,

  name?: string,
  kind?: Kind,

  memberof?: string,
  scope?: Scope,
  access?: Access,
  readonly?: boolean,
  abstract?: boolean,
  generator?: boolean,
  alias?: string,

  copyright?: string,
  author?: string,
  license?: string,
  version?: string,
  since?: string,
  lends?: string,
  override?: boolean,
  hideconstructor?: true,

  type?: DoctrineType,

  context: CommentContext,
  loc: CommentLoc,

  path?: Array<{
    name: string,
    scope: Scope
  }>,

  ignore?: boolean
};

type CommentMembers = {
  static: Array<Comment>,
  instance: Array<Comment>,
  events: Array<Comment>,
  global: Array<Comment>,
  inner: Array<Comment>
};

type CommentExample = {
  caption?: string,
  description?: Object
};

type Remark = {
  type: string,
  children: Array<Object>
};

type Access = 'private' | 'public' | 'protected';
type Scope = 'instance' | 'static' | 'inner' | 'global';
type Kind =
  | 'class'
  | 'constant'
  | 'event'
  | 'external'
  | 'file'
  | 'function'
  | 'member'
  | 'mixin'
  | 'module'
  | 'namespace'
  | 'typedef'
  | 'interface';
