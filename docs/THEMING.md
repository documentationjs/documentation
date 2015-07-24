This assumes you have node.js installed:

First install dev-documentation:

```
npm install -g dev-documentation@2.1.0-alpha1
```

Get a JSDoc-documented project to test against:

```
git clone git@github.com:mapbox/mapbox-gl-js.git
```

Get a checkout of the default style

```
git@github.com:documentationjs/documentation-theme-default.git
```

Now start theming

```
dev-documentation mapbox-gl-js/js/mapbox-gl.js -t ./documentation-theme-default/
```

If you have [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) installed, you can enable it and it'll automatically refresh the page when you edit the theme.
