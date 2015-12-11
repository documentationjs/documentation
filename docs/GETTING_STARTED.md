# Getting Started

Assuming that you've installed the `documentation` application, how do you
get started actually using it to document your code?

Traditionally you might write documentation by creating a new Markdown
file and typing in each function name and argument. Or you might not
write documentation at all.

`documentation` is a **documentation generator**, which means that it expects
you to document your code _within the code_: special JavaScript comments
in a format called JSDoc define what ends up in the docs.

**But don't worry! Even though it's next to code, JSDoc is a simple and standard
syntax that you can learn even if you aren't a full-time JavaScript developer.**

Let's dive in.

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
begins with `/**` instead of `/*`. JSDoc requires this: if you were
to write a comment like

```js
// --- INVALID - this is ignored by JSDOC ---
// This function adds one to its input.
// @param {number} input any number
// @returns {number} that number, plus one.
```

It would be ignored by JSDoc because it uses `//` syntax instead of `/**`.

Okay: so let's break down that example into lines:

```js
/**
 * This function adds one to its input.
 * ...
```

The first line of the comment is typically the _description_. This part
says _what the thing is or does_, within the space of a few sentences.

```js
 * @param {number} input any number
```

The second line is a little more complex. The parts are

* `@param` is **a tag**: there are many tags, and
  they all begin with the `@` symbol.
* `{number}` is **a type**. It says that the input to this function needs
  to be a JavaScript "number" type. It could also say string, like `{string}`,
  `{Object}`, `{Date}`, or any other JavaScript built-in type. And if you
  defined a custom class, like `FooClass`, you can use it as a type too by
  saying `{FooClass}`.
* `input` is the name of the input variable. It matches what the code
  says right below it (`function addOne(input)`).
* `any number` is the description of the input.

And then you see the next line: it's very similar to `@param`, but just a little
different: `@returns` instead of `@param`, and since returned values in JavaScript
don't have names, it just says the description of the value.

## Optional Parameters

Sometimes libraries allow you to omit a parameter. Documentation should
make this clear, and luckily there's a syntax that describes it:

```js
 * @param {number} [input=5] any number
```

This means that the number can be omitted, and if it is, it'll default
to 5.

## Development Process

If you're actively contributing documentation to a big project, there
are tools to help: [eslint's valid-jsdoc](http://eslint.org/docs/rules/valid-jsdoc) rule
lets you confirm JSDoc comment presence & validity as part of an
automated style check.

## The Tags

[usejsdoc.com](http://usejsdoc.org/index.html) covers all possible tags in the
JSDoc syntax, and is a great reference material. The most common tags
you'll see are:

* @param - input values given to a function as an argument
* @returns - output value of a function
* @name - explicitly set the documented name of a function, class, or variable
* @private - along with @public and @protected, you can use @private to document
  something for yourself without including it in generated documentation,
  since it isn't part of the public API
* @example - you can use the @example tag to add code examples of how to
  use some thing inline with the thing itself

It'll help to remember the available tags if your text editor highlights correct tags: if it
doesn't, try [using a plugin for JSDoc](https://github.com/documentationjs/documentation/wiki/Text-editor-plugins).

## Flow type annotations

Alternatively, [Flow](http://flowtype.org/) type annotations allows for a compacter syntax:

```js
/**
 * This function adds one to its input.
 */
function addOne(input: number): number {
  return input + 1;
}
```

## What `documentation` does

Documentation does some minor magic to generate documentation. Unless
you want to read the code for yourself, here's a summary of how it connects
to your task as a developer.

**Inference**: JSDoc lets you specify absolutely everything about your code:
use @name to say what something is called, @kind for whether it's a function
or a class, @param for its parameters, and so on. But writing all of that
explicitly is tedious, so where it can, `documentation` can automatically
fill in @name, @kind, and @memberof tags based on its reading of the source
code.

**Normalization**: JSDoc has multiple words for the same thing: you can
say @augments or @extends and they'll do the same thing. `documentation`
normalizes these values to make them styleable.
