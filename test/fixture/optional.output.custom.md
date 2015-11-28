# Address6

Represents an IPv6 address

**Parameters**

-   `address` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** An IPv6 address string
-   `groups` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** How many octets to parse (optional, default `8`)
-   `third` **?[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** A third argument
-   `foo` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)=** to properly be parsed (optional, default `[1]`)

**Examples**

```javascript
var address = new Address6('2001::/32');
```
