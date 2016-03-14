# Address6

Represents an IPv6 address

This tests  our support of optional parameters

**Parameters**

-   `address` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** An IPv6 address string
-   `groups` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** How many octets to parse
-   `third` **?[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** A third argument
-   `foo` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)=** to properly be parsed

**Examples**

```javascript
var address = new Address6('2001::/32');
```

# addThem

This function returns the number one.

**Parameters**

-   `a`  
-   `b` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** the second param
-   `c`  
-   `$3` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `$3.d`  
    -   `$3.e`  
    -   `$3.f`  

# fishesAndFoxes

This method has partially inferred params

**Parameters**

-   `$0` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `$0.fishes` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** number of kinds of fish
    -   `$0.foxes`  

# Foo

This is foo's documentation

## method

The method

**Parameters**

-   `x` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Param to method

# foo

This tests our support of JSDoc param tags without type information,
or any type information we could infer from annotations.

**Parameters**

-   `address`  An IPv6 address string

# GeoJSONSource

Create a GeoJSON data source instance given an options object

This tests our support of nested parameters

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=** optional options
    -   `options.data` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)\|[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** A GeoJSON data object or URL to it.
        The latter is preferable in case of large GeoJSON files.
    -   `options.maxzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Maximum zoom to preserve detail at.
    -   `options.buffer` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Tile buffer on each side.
    -   `options.tolerance` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=** Simplification tolerance (higher means simpler).

# myfunc

This tests our support for parameters with explicit types but with default
values specified in code.

**Parameters**

-   `x` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** an argument

Returns **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** some

# withDefault

This method has a type in the description and a default in the code

**Parameters**

-   `x` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)=(default 2)** 
