

## InterVoke

![](artwork/intervoke-logo-cutout.png)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterVoke](#intervoke)
- [Purpose](#purpose)
- [Motivation](#motivation)
- [Name](#name)
- [Glossary](#glossary)
- [Notes](#notes)
- [Derived Classes](#derived-classes)
  - [Word Prompter](#word-prompter)
  - [Phrasal Prompter](#phrasal-prompter)
  - [Generic and Specific Adjectives](#generic-and-specific-adjectives)
  - [Sentence Structure Diagram](#sentence-structure-diagram)
  - [AST Data Structure](#ast-data-structure)
  - [Plural Nouns](#plural-nouns)
- [Attribution](#attribution)
- [To Do](#to-do)
- [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## InterVoke

## Purpose

JavaScript API helper that allows to call methods on objects through properties, using the property name as
first argument. For example, `m.foo 42` (a call to `m.foo()` with *n* = 1 arument) gets translated (and is
equivalent) to `m 'foo', 42` (a call to `m` with *n* + 1 aruments).

## Motivation

I have been using this to build a 'snappy' API for runtime typechecks in JavaScript. Included in this
package is a class `Word_prompter` which splits property names into words (by looking for spaces and
underscores), then calls a method producer to retrieve a suitable method for the given phrase, caching
results on the way so only first-time accesses need to invoke phrase parsing.

Now, phrase parsing (which is outside of the scope of this package and will depend on one's use case) can
allow the type checker to detect that eg.

* a property `empty_list` on a type checker `isa` should determine whether a given argument `x` (as in
  `isa.empty_list x`) satisfies both `isa.list x` and `x.length is 0`, or that
* `isa.integer_or_numerical_text x` is satisfied when `isa.integer x` is `true` or, alternatively, both
  `isa.text x` and `/[0-9]+/.test x` hold.

This can result in very readable APIs, for which `InterVoke` provides the foundations, namely,

* providing proxied access to object properties, taking care of all the edge cases
* providing classes whose instantiations are callable functions (not very difficult but a little tricky)
* doing property name normalization
* caching

## Name

The name 'InterVoke' is both in line with my `/^inter[a-z]+$/` line of packages and, on the other hand,
symbolizes quite nicely that this library is all about intercepting method invocations—turning 'invocations'
into 'intervocations', in a manner of speaking. Thanks ChatGPT!


## Glossary

* **Prompter**: a `class Pr extends Prompter` that instantiates `pr = new Pr()` as a function which allows
  to be accessed in two ways: classical `pr 'acc', p, q, r...` or compressed `pr.acc p, q, r...`
* **Accessor**: the key used as first argument to access an attributor as in `pr.acc()`, sometimes
  symbolized as `acc`
* **Phrase**: list of 'words'/keys resulting from splitting the accessor by whitespace and underscores. This
  allows to build complex accessors like `isa.text_or_integer 42` (phrase: `[ 'text', 'or', 'integer', ]`)
* **Details**: arguments used in a attributor after the accessor. Ex.: In `pr.foo_bar 3, 4, 5`, `foo_bar` is
  the accessor key, `[ 'foo', 'bar', ]` is the accessor phrase, and `3, 4, 5` are the accessor details.
* **NCC**, *Normalized Accessor*: the `phrase` equivalent of an accessor, the words being joined with single
  `_` underscores. Ex.: All of `empty_text`, `empty text`, `empty_____text` are normalized to `empty_text`.
* *Alternative Accessors* are all the spelling variants (with multiple underscores, or words separated by
  whitespace) that result in the same NCC.

## Notes

* all methods and other instance properties whose names starts with a double underscore `__` are not proxied
  and returned directly; this allows users to implement functionality in derived classes while keeping the
  system's namespace separated from the instances' proxied accessors.

## Derived Classes

### Word Prompter

* In it self probably not a very useful class.
* It serves a base class for [`Phrasal_prompter`](#phrasal-prompter).
* All one can do is declaring functions either via the `declare` class property or the (private)
  `__declare()` method.
* set class property `declare` to an object with methods that will be `__declare()`d on initialisation
* Any access to non-declared properties will cause an error.


### Phrasal Prompter

* Intended for new version of [InterType](https://github.com/loveencounterflow/intertype); the following
  notes betray that and are written with the use case of building a runtime type checking library in mind.
* `Phrasal_prompter` is a derivative of `Word_prompter`.
* Like `Word_prompter`, `Phrasal_prompter` too will split property names into words by splitting on
  spaces and underscores. Unlike `Word_prompter`, `Phrasal_prompter` assumes a certain grammar for
  its accessors, here termed 'sentences' and 'phrases'.
* Words appearing in accessors are recognized as either
  * nouns like `integer`, `list`, `text`;
  * adjectives like `empty`, `positive`;
  * or connectives `of` and `or`.
* The connectives `of` and `or` are built-in, no nouns or adjectives are pre-defined.
  * Connectives, notably `or`, may not be used as words in new names (so it's OK to `declare.empty_list` or
    `declare.integer_text` regardless whether any of `empty`, `list`, `integer`, `text` are already known or
    not, but `declare.integer_or_text` is forbidden because it contains `or`. Same restriction on use of
    `of` may be lifted in the future).
* Nouns can be added by `declare()`ing them, as in `d.declare.mynoun ...` or, equivalently, `d.declare
  'mynoun', ...`.
* Adjectives are either generic or must be declared on the nouns that they can modify (because e.g. `empty`
  makes only sense when the noun describes something that can contain values, and `negative` makes only
  sense for numbers).
* Nouns are turned into functions and made properties (of the same name) of their base object (here shown as
  `isa` for the sake of exposition); so type `integer` is accessible as mthod `isa.integer()`.
* Adjectives are likewise turned into functions, but are made properties of the nouns they are declared on,
  so if adjective `positive` is delcared for type `integer`, then its correlated function may be accessed as
  `isa.integer.positive()` (as well as by `isa.positive_integer()`).
* `isa.empty_list x`: `isa.list.empty x`, which implictly starts with `isa.list x`
* `isa.nonempty_list_of_positive_integers x`: `isa.list x`, then `isa.list.nonempty x`, then, for each
  element `e`, `isa.integer.positive e`, which implictly starts with `isa.integer e`
* `isa.nonempty_empty_list_or_nonempty_text x`: must satisfy one of `isa.list.nonempty x`,
  `isa.text.nonempty x`
* `or` has lowest precedence so `isa.nonempty_empty_list_or_text x` is satisfied even when `x` is the empty
  string
* `isa.hinky_dinky_dong x`: holds when both `isa.dong.hinky x` and `isa.dong._dinky x` hold. The call to
  `isa.dong.hinky x` implicitly calls `isa.dong x`, the call to `isa.dong._dinky x` skips that test.

### Generic and Specific Adjectives

* Generic adjectives can be used with all types and can not be overridden by a type declaration. They always
  resolve to the same test for values of all types.
* There's currently a single generic adjective, `optional`, which returns `true` if its argument is `null`
  or `undefined`; if it does return `true`, evaluation is shortcut at that point (so `isa.optional_list
  null` is `true` although the argument is not a list). In effect, `isa.optional_T x` behaves like
  `isa.null_or_undefined_or_T x` and, equivalently, `isa.nothing_or_T x`.
* All other adjectives are specific to their types and can not be used with a type for which they are not
  declared; thus, `isa.positive_list x` and `isa.empty_integer x` produce errors at property access time.

### Sentence Structure Diagram

```
┌──────┐ ┌──┐    ┌──────┐ ┌──────┐    ┌──────┐ ┌──┐
│ adj. │ │n.│    │ adj. │ │ noun │    │ adj. │ │n.│
│      │ │  │    │      │ │      │    │      │ │  │

nonempty_list_of_positive_integers_or_nonempty_text

│ collection│    │ elements      │    │           │
│ phrase 1.1│    │ phrase 1.2    │    │           │
└───────────┘    └───────────────┘    │           │
│           │    adjunct         │    │           │
│           └────────────────────┘    │           │
│            phrase 1            │    │  phrase 2 │
└────────────────────────────────┘    └───────────┘
│                    sentence                     │
└─────────────────────────────────────────────────┘
```

* A sentence consists of one ore more alternative (noun) phrases.
* Multiple alternatives can be linked with the connective `or`.
* `or` has least precedence so whatever has been said in the phrase before it has no effect on the phrase
  that comes after it.
* A single noun always comes last in a phrase.
* A noun may be preceded by one or more adjectives.
* A list of adjectives may start with the special global adjective `optional`, which indicates that a value
  of `null` or `undefined` will satisfy the condition. Since `optional` vlaues are essentially 'typeless' in
  the sense that a `null` value could stand in for any kind of missing value (much like an empty list
  satisfies both `empty_list_of_strings` and `empty_list_of_numbers`), an `optional` present in *any*
  alternative makes the *entire* compound optional, so there's no difference between
  `optional_text_or_float`, `text_or_optional_float`, and `optional_text_or_optional_float`.
* Sentences that contain one or more undeclared words cause an error.
* Adjectives that precede a given noun in a phrase must be declared for that noun.
* A phrase with a noun that is declared to be a collection (a 'collection phrase') may be followed by the
  connective `of` and a phrase that describes its elements (an 'element phrase').
* A phrase that follows an `of` phrase to which it is connected with an `or` is understood to describe the
  'outer' value, not the element value; this is because `or` has lowest priority. Therefore,
  `isa.nonempty_list_of_integers_or_text x` holds when `x` is either a list of whole numbers or,
  alternatively, `x` is a text, possibly the empty string.
* To describe alternatives for elements, declare a custom type: `declare.frob 'integer_or_text';
  isa.list_of_frobs x` will hold when all (if any) elements in list `x` are either integers or texts; this
  is then equivalent to the longer `( isa.list_of_integers x ) or ( isa.list_of_texts x )`.


<!-- * to describe alternatives for elements, connect element phrases with the connective `or_of`, as in
  `list_of_integers_or_of_texts x` holds when `x` is a list whose elements are  whole numbers or, alternatively, any
  string (text). ### TAINT unclear whether each element can be either integer or string, or whether all
  elements must be either integers or strings. Latter barely useful.
 -->

### AST Data Structure

* An AST is an object with a two properties, `alternatives` and `optional`.
* `alternatives` is a non-empty list of `or` clauses ('alternatives'); in case no `or` was used, the list
  will hold a single clause.
* Each clause
  * `noun` (which names the type);
  * zero or more `adjectives`, and
  * one optional `elements` sub-clause which in itself is a clause and may have its own `elements`
    sub-clause.
* `optional` is `true` if any alternative clause had optional in it, and `false` otherwise.

```js
element_clause = {
  noun:         'integer',
  adjectives:   [ 'positive0', ],
  elements:     null, }

clause = {
  noun:         'list',
  adjectives:   [ 'nonempty', ],
  elements:     element_clause, }

alternatives  = [ clause, ]
ast           = { alternatives, optional: true, }
```

### Plural Nouns

Since [English plural rules are far too complex](https://en.wikipedia.org/wiki/English_plurals) to be
covered by anything less than extensive rule apparatus and long lists of special cases, `Phrasal_prompter`
uses a simple-minded algorithm (used by Sindre Sorhus' [`plur`](https://github.com/sindresorhus/plur),
re-implemented as [`GUY.str.pluralize`](https://github.com/loveencounterflow/guy#guystr)) to guess plurals
of nouns where not explicitly given in the declaration. Use of plurals is only done for readability (so one
can say `isa.set_of_oxen x` instead of `isa.set_of_ox x`); they are only recognized in elemental subphrases
(i.e. on the noun that finishes an `*_of_*` adjunct), and even there they are optional and normalized to
their singular equivalent (because of this, there's a borderline case when you declare both `foo` and `foos`
as singular nouns and then use a phrase like `list_of_foos` which will be normalized to `list_of_foo`; in
order to get an adjunct with `foos`, one has to either write `list_of_fooses` or declare `foo` and `foos` to
not change in the plural, as many English nouns like *deer* and *aricraft* do).

## Attribution

* project name as suggested by [ChatGPT](https://chat.openai.com)
* project logo as suggested by [Nolibox](https://creator.nolibox.com)

## To Do

* **[–]** docs
* **[–]** implement matching property names 'longest first' to allow for overrides that are
  implementationally simpler than literal translations (eg. in `isa.empty_list x`, it will be simpler to
  check first for `Array.isArray x`, then for `x.length is 0` instead of dealing with the different ways
  that emptiness can be detected in JS (`x.length`, `x.size`, ...))
* **[–]** can we use instance as the cache instead of using a seperate one? Then one could check for
  `target` having the property and just return it when found. Maybe use a map or set to simplify lookups.
* **[–]** collect all declarations in the prototype chain

## Is Done

* **[+]** name generated functions using the NCC
* **[+]** find a good name
* **[+]** In the above example where `declare.frob 'integer_or_text'` is used to declare a choice type to be
  used like `isa.list_of_frobs x`. According to the rules so far, it would indeed be possible to
  `declare.integer_or_text 'integer_or_text'`, where the tricky part is that this declaration will be the
  last time that `integer_or_text` is parsed; subsequent uses will only cause a lookup—which means that
  using `isa.nonempty_list_of_integer_or_text x` will mean something different prior to the declaration than
  it does following the declaration. Solutions:
  * **1)** disallow re-using existing names as parts of new names
  * **2)** less strictly, mandate use of at least one novel word in new names (a word that is not in itself
    already a known name) (so could use `either_integer_or_text` or `choose_integer_text`)
  * **3)** disallow using `or` (or other connectives, so `of`) in new names, treating them like PL keywords
  * solution 3) seems reasonable; adjectives + nouns (`empty_list`) or chains of nouns (`integer_text`) are
    not the problem, `or` is the problem


