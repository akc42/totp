Totp is a very simple set of functions to support the generation of time based one time passwords.  The only aim of this
package was to provide a simple set of functions to use in conjunction with the `npm qrcode` package to provide the
ability to set up and verify time based passwords using Google Authenticator.  For some time I had been using another
third party package, and although it worked flawlessly I had heard it reported that it was totally unmaintained.  I
decided to try and see if I could replicate the functions myself as a protection mechanism.

The more I got into it the more I found the code convoluted and far too bloated for what I needed, mainly because the
scope of this package was much broader than just meeting my simple requirement. So I worked on getting the essence of
the algorithmn and to see if I could replicate the results of the package that works.  The result is this simple
package. Given its size in comparison to what I was using previously I decided to package it up for use in my projects.

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



