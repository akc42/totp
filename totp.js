/**
@licence
    Copyright (c) 2026 Alan Chandler, all rights reserved

    This file is part of Totp.

    Totp is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Totp is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Totp.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
    The purpose of this library is to provide the ability to create and check time-based one time passwords.
    A key criteria is that is compatible with the results of the existing library - so that were these have already
    been set up they still work using google authenticator
*/
import {randomBytes, createHmac} from 'node:crypto';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const totpOptions = {
  period:30, 
  digits:6,
  algorithmn:'SHA1'
}

const makeKey = () => {
  return randomBytes(20).toString('hex');
}

const keyUri = (key, name, app) => {
  return `otpauth://totp/${encodeURIComponent(app)}:${encodeURIComponent(name)}?secret=${hexToBase32(key)}&period=${totpOptions.period}&digits=${
    totpOptions.digits}&algorithm=${totpOptions.algorithmn}&issuer=${encodeURIComponent(app)}`;
}
/*
  code is 6 digits from authenticator, key is the hex two factor key
*/
const verify = (code, key) => {
  if (typeof code !== 'string' || code.length !== totpOptions.digits) return false;
  if (!/\d/g.test(code)) return false;
  return code === passCode(key,0);  //get the code at window 0
}
/*
  key is hex secret key
  periods is number of periods ahead to find the code for 0 = active now;
*/
const passCode = (key, periods) => {
  const counter = Math.floor(Math.floor(Date.now()/1000)/totpOptions.period) + periods;
  const counterHex = counter.toString(16).padStart(16,'0');
  const counterBuf = Buffer.from(counterHex,'hex');
  const keyBuf = Buffer.from(key,'hex');
  const hmac = createHmac(totpOptions.algorithmn,keyBuf);
  const digest =  hmac.update(counterBuf).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const binary = (digest[offset] & 0x7f) << 24 | (digest[offset + 1] & 0xff) << 16 | (digest[offset + 2] & 0xff) << 8 | digest[offset + 3] & 0xff;
  const token = ((binary % 1000000) + '').padStart(6,'0');
  return token
}

const hexToBase32 = (input) => {
  let output = '';
  let next = 0;
  let lshift = 0;
  for(let i = 0; i< input.length; i++) {
    let digit = parseInt(input.charAt(i), 16);
    if (!Number.isInteger(digit)) throw new RangeError('Expected string to include only HEX digits');
    if (lshift > 0) {
      const rshift = 4 - lshift;
      const remainder = digit & (2**rshift - 1);
      next |= digit >>> rshift;
      output += alphabet.charAt(next);
      lshift = (lshift + 1) % 5;
      next = remainder << lshift;
    } else {
      lshift++;
      next = digit << lshift;
    }
  }
  if (lshift > 0) output += alphabet.charAt(next);
  return output;
}

/*

The code below (before some minor modifications by me) was obtained from elsewhere with the attached notice

MIT License

Copyright (c) 2016-2021 Linus Unnebäck

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const base32ToHex = (input) => {
  input = input.replace(/=+$/, '')
  const length = input.length
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.ceil(length * 5 / 8) | 0)
  for (var i = 0; i < length; i++) {
    value = (value << 5) | alphabet.indexOf(input[i].toUpperCase())
    bits += 5
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }
  return Buffer.from(output).toString('hex');

}

export {
  base32ToHex,
  hexToBase32,
  keyUri,
  makeKey,
  passCode,
  verify
}

