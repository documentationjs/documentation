# Address6

Represents an IPv6 address

**Parameters**

-   `address` **string** An IPv6 address string
-   `groups` **[number]** How many octets to parse (optional, default `8`)
-   `third` **[number]** A third argument
-   `foo` **[Array]** to properly be parsed (optional, default `[1]`)

**Examples**

```javascript
var address = new Address6('2001::/32');
```
