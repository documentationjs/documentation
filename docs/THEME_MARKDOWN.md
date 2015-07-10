# Markdown

Markdown templates, just like HTML templates, are [Handlebars](http://handlebarsjs.com/)
files. A markdown template is defined as `markdown.hbs` in a theme module.

# Helpers

* `{{format_params PARAMS}}`: format function parameters
* `{{format_type}}`: format an object type
* `{{format_description}}`: format a description, converting inline tags into
Markdown
* `{{inlines}}`: convert inline JSDoc tags into Markdown
