# sessions.create

Attempt to establish a cookie-based session in exchange for credentials.


**Parameters**

-   `credentials` **object** 
    -   `credentials.name` **string** Login username. Also accepted as `username` or `email`.

    -   `credentials.password` **string** Login password

-   `callback` **[function]** Gets passed `(err, { success:Boolean })`.



Returns **Promise** promise, to be resolved on success or rejected on failure



