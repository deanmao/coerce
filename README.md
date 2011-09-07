# Coerce

  Simple chaining style type validator inspired by Waleed's Purify
python library

## Features

  - light-weight
  - can be used via node or browser
  - geared to make code more readable & reusable

## Usage

    var c = require('coerce');
    var easyInt = c.strip().int();
    easyInt.coerce("   123   ") ---> 123
    easyInt.default(456).coerce("asdf") ---> 456

