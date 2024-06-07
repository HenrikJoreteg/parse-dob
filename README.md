# parse-dob

![](https://img.shields.io/npm/dm/parse-dob.svg)![](https://img.shields.io/npm/v/parse-dob.svg)![](https://img.shields.io/npm/l/parse-dob.svg)

Turn freeform inputs describing someone's birth date like `jan 12, 82`, or `1/12/1982` (in UK), or `12-1-1982` (in the US) into `1982-01-12`. It will even handle various locale-specific input like: ` ١٨‏/١‏/١٩` or `5. 7. 1925` or `1924年9月25日` or `25‏/9‏/1924`.

It's specific to birth dates because it makes some assumptions that you're < 100 years old when providing a two-digit year.

This is meant for allowing a user to "free form" type a date of birth into in input field, and be able to make it into a format the backend can understand.

It always outputs `"YYYY"`, `"YYYY-MM"`, `"YYYY-MM-DD"`, or `null`

It's often difficult to deal wth order of month and dates. Different locales will write the same date as either `1/2/2010` or `2/1/2010`.

To get around this it uses `Date.prototype.toLocaleDateString()` on a known date without setting a locale and determine what order it puts the known date numbers in. Then when it's parsing it can default to guessing that same arrangement.

This util is meant to enable instant feedback as a user types into an input field.

There are a lot more examples in the tests.

## install

```
npm install parse-dob
```

# usage

```js
import parseDob from 'parse-dob'

parseDob('sept 29 82') // 1982-09-29
```

# test

```
npm test
```

## Change log

- `1.1.3`: Better handling of locales where year is default first like CA.
- `1.1.2`: Updated to always return `null` for non-string inputs
- `1.1.1`: Updated to support just numbers as a string.
- `1.0.3`: Added fix for bug with two numbers as input. `12 29` is now `1929-12`.
- `1.0.2`: Require 3 letters for written months to minimize false positives.
- `1.0.1`: JS Doc fix.
- `1.0.0`: Considered stable. In use in app.
- `0.0.4`: Prevent future dates of any kind
- `0.0.3`: Better handling of bad input.
- `0.0.2`: Fixed handling of empty input. Improved JS doc for export.
- `0.0.1`: First public release.

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter. This was built for and is in use in: [AnesthesiaCharting.com](https://anesthesiacharting.com).

## license

[MIT](http://mit.joreteg.com/)
