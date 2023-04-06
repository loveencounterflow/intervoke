

## InterVoke

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterVoke](#intervoke)
- [Purpose](#purpose)
- [Motivation](#motivation)
- [Notes](#notes)
- [Derived Classes](#derived-classes)
  - [Analyzing Attributor](#analyzing-attributor)
- [To Do](#to-do)
- [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

![](artwork/intervoke-logo-cutout.png)

## InterVoke

## Purpose

JavaScript API helper that allows to call methods on objects through properties, using the property name as
first argument. For example, `m.foo 42` (a call to `m.foo()` with *n* = 1 arument) gets translated (and is
equivalent) to `m 'foo', 42` (a call to `m` with *n* + 1 aruments).

## Motivation

I have been using this to build a 'snappi' API for runtime typechecks in JavaScript. Included in this
package is a class `Analyzing_attributor` which splits property names into words (by looking for spaces and
underscores), then calls a method producer to retrieve a suitable method for the given phrase, caching
results on the way so only first-time accesses need to invoke phrase parsing.

Now, phrase parsing (which is outside of the scope of this package and will depend on one's use case) allows
to detect that eg. a type checker for a property `empty_list` should check that a given argument `x` (as in
`isa.empty_list x`) should satisfy both `isa.list x` and `x.length is 0`, or that
`isa.integer_or_numerical_text x` is satisfied when `isa.integer x` is `true` or, alternatively, both
`isa.text x` and `/[0-9]+/.test x` hold. This can result in very readable APIs, for which `InterVoke` provides
the foundations, namely,

* providing proxied access to object properties, taking care of all the edge cases
* providing classes whose instantiations are callable functions (not very difficult but a little tricky)



## Notes

* **Attributor**: a `class Atr extends Accessor` that instantiates `atr = new Atr()` as a function which
  allows to be accessed in two ways: classical `atr 'acc', p, q, r...` or compressed `atr.acc p, q, r...`
* **Accessor**: the key used as first argument to access an attributor as in `atr.acc()`, sometimes
  symbolized as `acc`
* **Phrase**: list of 'words'/keys resulting from splitting the accessor by whitespace and underscores. This
  allows to build complex accessors like `isa.text_or_integer 42` (phrase: `[ 'text', 'or', 'integer', ]`)
* **Details**: arguments used in a attributor after the accessor. Ex.: In `atr.foo_bar 3, 4, 5`, `foo_bar`
  is the accessor key, `[ 'foo', 'bar', ]` is the accessor phrase, and `3, 4, 5` are the accessor details.
* **NCC**, *Normalized Accessor*: the `phrase` equivalent of an accessor, the words being joined with single
  `_` underscores. Ex.: All of `empty_text`, `empty text`, `empty_____text` are normalized to `empty_text`.
* *Alternative Accessors* are all the spelling variants (with multiple underscores, or words separated by
  whitespace) that result in the same NCC.

* all methods and other instance properties whose names starts with a double underscore `__` are not proxied
  and returned directly; this allows users to implement functionality in derived classes while keeping the
  system's namespace separated from the instances' proxied accessors.

## Derived Classes

### Analyzing Attributor

class Aa extends Analyzing_attributor

aa = new Aa
resolution = aa

## To Do

* **[–]** docs
* **[–]** find a good name

## Is Done

* **[+]** name generated functions using the NCC


