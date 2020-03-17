# Getting Started

`documentation` is a **documentation generator**. It's used to generate documentation from
comments _within your code_. `documentation` processes JavaScript comments
in the JSDoc format. 

**But don't worry! Even though it's embedded in your code, JSDoc is not code. It's a simple and standard
syntax for writing documentation. You don't need to be a developer to use it.**

Before you continue, make sure `documentation` is on your system. (If it's not installed, run `npm install -g documentation`.)

Now, let's dive in.

## The Essentials

For the most part, the things you document will be functions or classes
of JavaScript libraries. Let's start with a function and how to document
its essential parts.

```js
/**
 * This function adds one to its input.
 * @param {number} input any number
 * @returns {number} that number, plus one.
 */
function addOne(input) {
  return input + 1;
}
```

The comment before the `addOne` function is a JSDoc comment. Note that it
begins with `/**` instead of `/*`. JSDoc requires this.

If you were to write a comment like this:

```js
// --- INVALID - this is ignored by JSDOC ---
// This function adds one to its input.
// @param {number} input any number
// @returns {number} that number, plus one.
```

...the comment would be ignored by `documentation`,  because it uses `//` syntax instead of `/**`.
It's not valid JSDoc syntax.

Let's break down the earlier JSDoc example:

```js
/**
 * This function adds one to its input.
 * ...
```

The first line of the comment is typically the _description_. This section
says _what the code is or does_.

```js
 * @param {number} input any number
```

On the second line:

* `@param` is **a tag**: This tag indicates that we'll be documenting a function's parameter.
* `{number}` is **a type**. It says that the input to this function is
  a JavaScript "number." It could also say `{string}`,
  `{Object}`, `{Date}`, or any other JavaScript built-in type. And if you
  defined a custom class, like `FooClass`, you can use it as a type, too! Just say `{FooClass}`.
* `input` is the name of the input variable. It matches what the code
  says right below it (`function addOne(input)`).
* `any number` is the description of the input.

On the third line, there's `@returns`. JavaScript returned values 
don't have names, so we just have a description of the value.

## Optional Parameters

Sometimes functions allow you to omit a parameter. 
This is the syntax that describes an optional parameter:

```js
 * @param {number} [input=5] any number
```

If an input is omitted, the default value of `5` will be passed to the function.

## What `documentation` does, so you don't have to

`documentation` does some minor magic to auto-generate documentation. Unless
you want to read the code for yourself, here's a summary of its magic:

**Inference**: JSDoc lets you specify absolutely everything about your code:
use `@name` to say what something is called, `@kind` for whether it's a function
or a class, `@param` for its parameters, and so on. But writing all of that
explicitly is tedious, so where it can, `documentation` automatically
populates `@name`, `@kind`, and `@memberof` tags based on its reading of the
code.

**Normalization**: JSDoc has multiple words for the same thing: you can
say `@augments` or `@extends`, and they'll do the same thing.

## Development Process

If you're contributing documentation to a large project, there
are tools to help: [eslint's valid-jsdoc](https://eslint.org/docs/rules/valid-jsdoc) rule
lets you confirm the presence of, and validate, JSDoc comments as part of an
automated style check.

## The Tags

[**`jsdoc.app`**](https://jsdoc.app/) covers all available tags in the
JSDoc syntax, and is a great reference. The most commonly used tags
are:

* @param - input is given to a function as an argument
* @returns - output value of a function
* @name - explicitly set the documented name of a function, class, or variable
* @private - you can use @private to document
  code and not have it included in the generated documentation,
  maybe it's not part of the public API. There's also @public and @protected 
* @example - you can use the @example tag to add inline code examples with your
  documentation

If your text editor does not highlight JSDoc tags, 
try [using a plugin for JSDoc](https://github.com/documentationjs/documentation/wiki/Text-editor-plugins).

## Flow type annotations

Alternatively, [Flow](https://flow.org) type annotations allows for a more compact syntax:

```js
/**
 * This function adds one to its input.
 */
function addOne(input: number): number {
  return input + 1;
}
```

# Learn more

[Continue reading](https://github.com/documentationjs/documentation#documentation) about Usage and the other aspects of `documentation`.
