# sessions.create

Attempt to establish a cookie-based session in exchange for credentials.

**Parameters**

-   `credentials` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `credentials.name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Login username. Also accepted as `username` or `email`.
    -   `credentials.password` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Login password
-   `callback` **\[[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** Gets passed `(err, { success:Boolean })`.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** promise, to be resolved on success or rejected on failure
