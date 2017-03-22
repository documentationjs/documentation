# Plugins

documentation.js doesn't have plugins, yet. We want to have plugins, but want to
_nail it_ on the first try, to save plugin authors unnecessary back-and-forth. We
want to learn from the lessons of systems like eslint, babel, browserify, and so on.

_That said_, this is where we'll document experimental plugin APIs, the first
being `dangerousCustomInference`. 

Quick example of what you can do with that:

```js
documentation
  .build(['./test.js'], {
    dangerousCustomInference: function(comment) {
      var classProperties = [];
      comment.context.ast.traverse({
        ClassProperty(path) {
          classProperties.push(path.node.name);
        }
      });
      comment.classProperties = classProperties;
      return comment;
    }
  })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err.stack);
  });
```
