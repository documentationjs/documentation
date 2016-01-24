# autolink

Link text to this page or to a central resource.


**Parameters**

-   `paths` **Array&lt;string&gt;** list of valid namespace paths that are linkable

-   `text` **string** inner text of the link



Returns **string** potentially linked HTML




# commentsToAST

Given a hierarchy-nested set of comments, generate an remark-compatible
Abstract Syntax Usable for generating Markdown output


**Parameters**

-   `comments` **Array&lt;Object&gt;** nested comment

-   `opts` **Object** currently none accepted

-   `callback` **Function** called with AST



Returns **undefined** calls callback




# countModuleIdentifiers

Count leading identifiers that refer to a module export (`exports` or `module.exports`).


**Parameters**

-   `comment` **Object** parsed comment

-   `identifiers` **Array&lt;string&gt;** array of identifier names



Returns **number** number of identifiers referring to a module export (0, 1 or 2)




# dependencyStream

Returns a readable stream of dependencies, given an array of entry
points and an object of options to provide to module-deps.

This stream requires filesystem access, and thus isn't suitable
for a browser environment.


**Parameters**

-   `indexes` **Array&lt;string&gt;** paths to entry files as strings

-   `options` **Object** optional options passed

-   `callback` **Function** called with (err, inputs)



Returns **undefined** calls callback




# documentation

Generate JavaScript documentation as a list of parsed JSDoc
comments, given a root file as a path.


**Parameters**

-   `indexes` **Array&lt;string&gt; or string** files to process

-   `options` **Object** options
    -   `options.external` **Array&lt;string&gt;** a string regex / glob match pattern
        that defines what external modules will be whitelisted and included in the
        generated documentation.
    -   `options.polyglot` **[boolean]** parse comments with a regex rather than
        a proper parser. This enables support of non-JavaScript languages but
        reduces documentation's ability to infer structure of code.
         (optional, default `false`)
    -   `options.shallow` **[boolean]** whether to avoid dependency parsing
        even in JavaScript code. With the polyglot option set, this has no effect.
         (optional, default `false`)
    -   `options.order` **[Array&lt;string or Object&gt;]** ] optional array that
        defines sorting order of documentation
         (optional, default `[`)
-   `callback` **Function** to be called when the documentation generation
    is complete, with (err, result) argumentsj



Returns **undefined** calls callback




# flatten

Flattens tags in an opinionated way.

The following tags are assumed to be singletons, and are flattened
to a top-level property on the result whose value is extracted from
the tag:

-   `@name`
-   `@memberof`
-   `@classdesc`
-   `@kind`
-   `@class`
-   `@constant`
-   `@event`
-   `@external`
-   `@file`
-   `@function`
-   `@member`
-   `@mixin`
-   `@module`
-   `@namespace`
-   `@typedef`
-   `@access`
-   `@lends`

The following tags are flattened to a top-level array-valued property:

-   `@param` (to `params` property)
-   `@property` (to `properties` property)
-   `@returns` (to `returns` property)
-   `@augments` (to `augments` property)
-   `@example` (to `examples` property)
-   `@throws` (to `throws` property)

The `@global`, `@static`, `@instance`, and `@inner` tags are flattened
to a `scope` property whose value is `"global"`, `"static"`, `"instance"`,
or `"inner"`.

The `@access`, `@public`, `@protected`, and `@private` tags are flattened
to an `access` property whose value is `"protected"` or `"private"`.
The assumed default value is `"public"`, so `@access public` or `@public`
tags result in no `access` property.


**Parameters**

-   `comment` **Object** a parsed comment



Returns **Object** comment with tags flattened




# html

Formats documentation as HTML.


**Parameters**

-   `comments` **Array&lt;Object&gt;** parsed comments

-   `opts` **Object** Options that can customize the output
    -   `opts.theme` **[string]** Name of a module used for an HTML theme.

-   `callback` **Function** called with array of results as vinyl-fs objects



Returns **undefined** calls callback




# inferKind

Infers a `kind` tag from other tags or from the context.


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with kind inferred




# inferName

Infers a `name` tag from the context,
and adopt `@class` and other other tags as implied name tags.


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with name inferred




# inferParams

Infers param tags by reading function parameter names


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with parameters




# inferReturn

Infers returns tags by using Flow return type annotations


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with return tag inferred




# isJSDocComment

Detect whether a comment is a JSDoc comment: it must be a block
comment which starts with two asterisks, not any other number of asterisks.

The code parser automatically strips out the first asterisk that's
required for the comment to be a comment at all, so we count the remaining
comments.


**Parameters**

-   `comment` **Object** an ast-types node of the comment



Returns **boolean** whether it is valid




# json

Formats documentation as a JSON string.


**Parameters**

-   `comments` **Array&lt;Object&gt;** parsed comments

-   `opts` **Object** Options that can customize the output

-   `callback` **Function** called with null, string



Returns **undefined** calls callback




# linkGitHub

Attempts to link code to its place on GitHub.


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with github inferred




# markdown

Formats documentation as
[Markdown](http://daringfireball.net/projects/markdown/).


**Parameters**

-   `comments` **Array&lt;Object&gt;** parsed comments

-   `opts` **Object** Options that can customize the output

-   `callback` **Function** called with null, string



Returns **undefined** calls callback




# nestParams

Nests
[parameters with properties](http://usejsdoc.org/tags-param.html#parameters-with-properties).

A parameter `employee.name` will be attached to the parent parameter `employee` in
a `properties` array.

This assumes that incoming comments have been flattened.


**Parameters**

-   `comment` **Object** input comment



Returns **Object** nested comment




# normalize

Normalizes synonymous tags to the canonical tag type listed on <http://usejsdoc.org/>.

For example, given the input object:

    { tags: [
      { title: "virtual" },
      { title: "return", ... }
    ]}

The output object will be:

    { tags: [
      { title: "abstract" },
      { title: "returns", ... }
    ]}

The following synonyms are normalized:

-   virtual -> abstract
-   extends -> augments
-   constructor -> class
-   const -> constant
-   defaultvalue -> default
-   desc -> description
-   host -> external
-   fileoverview, overview -> file
-   emits -> fires
-   func, method -> function
-   var -> member
-   arg, argument -> param
-   prop -> property
-   return -> returns
-   exception -> throws
-   linkcode, linkplain -> link


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with normalized properties




# externals

Create a filter function for use with module-deps, allowing the specified
external modules through.


**Parameters**

-   `indexes` **Array&lt;string&gt;** the list of entry points that will be
    used by module-deps

-   `options` **Object** An options object with `external` being a
    micromatch-compaitible glob. _NOTE:_ the glob will be matched relative to
    the top-level node_modules directory for each entry point.



Returns **function** A function for use as the module-deps `postFilter`
options.




# filterAccess

Exclude given access levels from the generated documentation: this allows
users to write documentation for non-public members by using the
`@private` tag.


**Parameters**

-   `levels` **[Array&lt;string&gt;]** ] excluded access levels.
     (optional, default `['private'`)
-   `comments` **Array&lt;Object&gt;** parsed comments (can be nested)



Returns **Array&lt;Object&gt;** filtered comments




# filterJS

Node & browserify support requiring JSON files. JSON files can't be documented
with JSDoc or parsed with espree, so we filter them out before
they reach documentation's machinery.


**Parameters**

-   `data` **Object** a file as an object with 'file' property



Returns **boolean** whether the file is json




# findGit

Given a full path to a single file, iterate upwards through the filesystem
to find a directory with a .git file indicating that it is a git repository


**Parameters**

-   `filename` **string** any file within a repository



Returns **string** repository path




# formatMarkdown

This helper is exposed in templates as `md` and is useful for showing
Markdown-formatted text as proper HTML.


**Parameters**

-   `string` **string** 



**Examples**

```javascript
var x = '## foo';
// in template
// {{ md x }}
// generates <h2>foo</h2>
```



Returns **string** string




# formatParameter

Format a parameter name. This is used in formatParameters
and just needs to be careful about differentiating optional
parameters


**Parameters**

-   `param` **Object** a param as a type spec



Returns **string** formatted parameter representation.




# formatParameters

Format the parameters of a function into a quickly-readable
summary that resembles how you would call the function
initially.


Returns **string** formatted parameters




# formatType

Helper used to format JSDoc-style type definitions into HTML.


**Parameters**

-   `type` **Object** type object in doctrine style

-   `paths` **Array&lt;string&gt;** valid namespace paths that can be linked



**Examples**

```javascript
var x = { type: 'NameExpression', name: 'String' };
// in template
// {{ type x }}
// generates String
```



Returns **string** string




# generate

Generate an AST chunk for a comment at a given depth: this is
split from the main function to handle hierarchially nested comments


**Parameters**

-   `depth` **number** nesting of the comment, starting at 1

-   `comment` **Object** a single comment



Returns **Object** remark-compatible AST




# getGithubURLPrefix

Given a a root directory, find its git configuration and figure out
the HTTPS URL at the base of that GitHub repository.


**Parameters**

-   `root` **string** path at the base of this local repo



Returns **string** base HTTPS url of the GitHub repository




# getTemplate

Get a Handlebars template file out of a theme and compile it into
a template function


**Parameters**

-   `Handlebars` **Object** handlebars instance

-   `themeModule` **string** base directory of themey

-   `name` **string** template name



Returns **Function** template function




# hierarchy




**Parameters**

-   `comments` **Array&lt;Object&gt;** an array of parsed comments



Returns **Array&lt;Object&gt;** nested comments, with only root comments
at the top level.




# highlight

Highlights the contents of the `example` tag.


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with highlighted code




# highlightString

Given a string of JavaScript, return a string of HTML representing
that JavaScript highlighted.


**Parameters**

-   `example` **string** string of javascript



Returns **string** highlighted html




# htmlHelpers

Given a Handlebars instance, register helpers


**Parameters**

-   `Handlebars` **Object** template instance

-   `paths` **Array&lt;string&gt;** list of valid namespace paths that are linkable



Returns **undefined** invokes side effects on Handlebars




# lint

Passively lints and checks documentation data.


**Parameters**

-   `comment` **Object** parsed comment



Returns **Array&lt;Object&gt;** array of errors




# markdownLink

Format a description and target as a Markdown link.


**Parameters**

-   `description` **string** the text seen as the link

-   `href` **string** where the link goes



Returns **string** markdown formatted link




# membership

Uses code structure to infer `memberof`, `instance`, and `static`
tags from the placement of JSDoc
annotations within a file


**Parameters**

-   `comment` **Object** parsed comment



Returns **Object** comment with membership inferred




# paramWithDefaultToDoc

Given a parameter like

    function a(b = 1)

Format it as an optional parameter in JSDoc land


**Parameters**

-   `param` **Object** ESTree node



Returns **Object** JSDoc param




# parseComment

Parse a comment with doctrine and decorate the result with file position and code context.


**Parameters**

-   `comment` **Object** the current state of the parsed JSDoc comment



Returns **undefined** this emits data




# parseJSDoc

Parse a comment with doctrine, decorate the result with file position and code
context, handle parsing errors, and fix up various infelicities in the structure
outputted by doctrine.


**Parameters**

-   `comment` **string** input to be parsed

-   `loc` **Object** location of the input

-   `context` **Object** code context of the input



Returns **Object** an object conforming to the
[documentation JSON API](https://github.com/documentationjs/api-json) schema




# parseJavaScript

Receives a module-dep item,
reads the file, parses the JavaScript, and parses the JSDoc.


**Parameters**

-   `data` **Object** a chunk of data provided by module-deps



Returns **Array&lt;Object&gt;** an array of parsed comments




# parsePolyglot

Documentation stream parser: this receives a module-dep item,
reads the file, parses the JavaScript, parses the JSDoc, and
emits parsed comments.


**Parameters**

-   `data` **Object** a chunk of data provided by module-deps



Returns **Array&lt;Object&gt;** adds to memo




# resolveTheme

Given the name of a theme as a module, return the directory it
resides in, or throw an error if it is not found


**Parameters**

-   `theme` **string** the module name



Returns **string** directory




# shallow

A readable source for content that doesn't do dependency resolution, but
simply reads files and pushes them onto a stream.

If an array of strings is provided as input to this method, then
they will be treated as filenames and read into the stream.

If an array of objects is provided, then we assume that they are valid
objects with `source` and `file` properties, and don't use the filesystem
at all. This is one way of getting documentation.js to run in a browser
or without fs access.


**Parameters**

-   `indexes` **Array&lt;string or Object&gt;** entry points

-   `options` **Object** parsing options

-   `callback` **Function** called with (err, inputs)



Returns **undefined** calls callback




# walk

Apply a function to all comments within a hierarchy: this iterates
through children in the 'members' property.


**Parameters**

-   `comments` **Array&lt;Object&gt;** an array of nested comments

-   `fn` **Function** a walker function



Returns **Array&lt;Object&gt;** comments



