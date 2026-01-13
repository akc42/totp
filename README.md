Totp is a very simple set of functions to support the generation of time based one time passwords.  The only aim of this
package was to provide a simple set of functions to use in conjunction with the `npm qrcode` package to provide the
ability to set up and verify time based passwords using Google Authenticator.  For some time I had been using another
third party package, and although it worked flawlessly I had heard it reported that it was totally unmaintained.  I
decided to try and see if I could replicate the functions myself as a protection mechanism.

The more I got into it the more I found that the essence of the algorithmn is really simple and could be implemented
using only the `node:crypto` package and a `hexToBase32` module I had already written as part of porting data from SQL
Server to SQLite. Given its size in comparison to what I was using previously I decided to package it up for use in my
projects.

That is this package.

Before I talk about the interface, a number of basics.  The key that is carried around will be in hex.  With the old
package I carried keys around in the underlying "base32" character set - somthing that the Google Autheticator needs
(within the keyuri that is represented in the QR Code that the it reads).  However the more I looked into things, all
the underlying security routines could work with Hex strings and my database (SQLite) could take a Hex string and store
the result in a "BLOB", and it could also return data from a BLOB as a Hex string. I decided therefore to do most
manipulation in Hex and only convert to base32 when building the keyUri.  This package contains the **hexToBase32**
software that does that conversion.  I also include **base32ToHex** incase anyone what to work with primarly the base32
strings and only use Hex when passing to these routines.  Both routines take the appropriate form as a string (uppercase
only for base32, lowercase only for hex) as its only parameter and return the other form.

**makeKey** returns a 40 random hex character string (no parameters needed)

**keyUri** takes in parameters `key`, `username`, `appname` (also know as `issuer`) and returns a `uri` that can be
passed to the qrcode module to produce a qrcode.

**verify** take in a `code` (the 6 digit code displayed by google authenticator) as a `String` and the `key` (in Hex)
and returns `true` or `false` dependant on whether the code is the correct on for the key at the instance the function
was called.  NOTE: this requires the computer this runs with to be closely in sync in time.

**passCode** although just a helper for verify, I decided to extract and enhance the software that takes the time now,
and the secret `key` and calculates the `code` (for comparison in verify).  It takes an extra paramter `periods` which
is the number of periods (30 seconds if left unchanged) and produces the code for a period ahead.  0 is now 1 is for 30
seconds time etc. Negative values should work also - useful to build a different verify with a wider time range.



