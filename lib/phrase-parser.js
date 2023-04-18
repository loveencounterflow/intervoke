(function() {
  'use strict';
  var E, GUY, Phrase_parser, debug, get_base_types, help, info, rpr, urge, vocabulary, warn;

  //===========================================================================================================
  GUY = require('guy');

  ({debug, info, warn, urge, help} = GUY.trm.get_loggers('INTERVOKE/PROMPT-PARSER'));

  ({rpr} = GUY.trm);

  ({get_base_types} = require('./types'));

  E = require('./errors');

  //===========================================================================================================
  vocabulary = {
    of: {
      role: 'of'
    },
    or: {
      role: 'or'
    },
    optional: {
      role: 'optional'
    },
    //.......................................................................................................
    empty: {
      role: 'adjective'
    },
    nonempty: {
      role: 'adjective'
    },
    positive: {
      role: 'adjective'
    },
    negative: {
      role: 'adjective'
    },
    //.......................................................................................................
    text: {
      role: 'noun',
      adjectives: ['empty', 'nonempty']
    },
    list: {
      role: 'noun',
      adjectives: ['empty', 'nonempty']
    },
    integer: {
      role: 'noun',
      adjectives: ['positive', 'negative']
    }
  };

  //===========================================================================================================
  this.Phrase_parser = Phrase_parser = class Phrase_parser {
    //---------------------------------------------------------------------------------------------------------
    parse(sentence) {
      var R, adjectives, alternative, alternatives, depth, element_clause, noun, noun_entry, phrase, ref, ref1, words;
      words = sentence.split('_');
      // debug '^99-1^', element_clauses
      alternatives = [];
      R = {
        alternatives,
        optional: false
      };
      ref = this._walk_alternative_phrases(words);
      for (phrase of ref) {
        depth = -1;
        ref1 = this._walk_element_clauses(phrase);
        for (element_clause of ref1) {
          debug('^4534^', sentence, GUY.trm.green(depth), GUY.trm.gold(element_clause));
          depth++;
          // unless depth is 0
          //...................................................................................................
          ({phrase} = element_clause);
          if (phrase.length === 0) {
            throw new E.Empty_alternative_phrase('^Phrase_parser.parse^', sentence);
          }
          noun = phrase.at(-1);
          noun_entry = this._get_vocabulary_entry(phrase, noun, 'noun');
          //...................................................................................................
          /* NOTE not entirely correct, must look for 'of' */
          adjectives = this._get_adjectives(R, phrase);
          alternative = {noun, adjectives};
          alternatives.push(alternative);
        }
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    * _$walk_alternative_phrases(sentence) {
      /* assuming no empty strings */
      var i, len, phrase, word;
      phrase = [];
      for (i = 0, len = sentence.length; i < len; i++) {
        word = sentence[i];
        if (word === 'or') {
          yield phrase;
          phrase = [];
          continue;
        }
        phrase.push(word);
      }
      yield phrase;
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * _walk_alternative_phrases(words) {
      var phrase, ref, sentence;
      ref = this._$walk_alternative_phrases(words);
      for (phrase of ref) {
        sentence = words.join(' ');
        if (phrase.length === 0) {
          throw new Error(`empty alternative clause in sentence ${rpr(sentence)}`);
        }
        yield phrase;
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _get_vocabulary_entry(phrase, word, role = null) {
      var R, phrase_txt;
      if ((R = vocabulary[word]) == null) {
        phrase_txt = phrase.join('_');
        throw new Error(`word ${rpr(word)} in phrase ${rpr(phrase_txt)} is unknown`);
      }
      if ((role != null) && R.role !== role) {
        phrase_txt = phrase.join('_');
        throw new Error(`expected word ${rpr(word)} in phrase ${rpr(phrase_txt)} to have role ${rpr(role)} but is declared to be ${rpr(R.role)}`);
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    _get_adjectives(ast, phrase) {
      var R, adjective, i, idx, len, phrase_txt;
      R = [];
      for (idx = i = 0, len = phrase.length; i < len; idx = ++i) {
        adjective = phrase[idx];
        if (idx >= phrase.length - 1) {
          break;
        }
        if (adjective === 'optional') {
          if (idx !== 0) {
            phrase_txt = phrase.join('_');
            throw new Error(`expected 'optional' to occur as first word in phrase, got ${rpr(phrase_txt)}`);
          }
          ast.optional = true;
          continue;
        }
        this._get_vocabulary_entry(phrase, adjective, 'adjective');
        R.push(adjective);
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    _find_element_clauses(words) {
      var R, clause, i, idx, len, word;
      R = {
        phrase: []
      };
      for (idx = i = 0, len = words.length; i < len; idx = ++i) {
        word = words[idx];
        if (word === 'or') {
          clause = words.join('_');
          throw new E.Not_allowed_to_use_or_in_element_clause('^Phrase_parser._find_element_clauses^', clause);
        }
        if (word === 'of') {
          R.elements = this._find_element_clauses(words.slice(idx + 1));
          return R;
        }
        R.phrase.push(word);
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    * _walk_element_clauses(words) {
      var clause;
      clause = this._find_element_clauses(words);
      yield* this._$walk_element_clauses(clause);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * _$walk_element_clauses(clause) {
      yield clause;
      if (clause.elements != null) {
        yield* this._$walk_element_clauses(clause.elements);
      }
      return null;
    }

  };

  // #---------------------------------------------------------------------------------------------------------
// #.........................................................................................................
/* NOTE likely not to be used: */
// T?.eq ( pp._find_all [ 'nonempty', 'list', 'of', 'list', 'of', 'text', ], 'of'        ), [ 2, 4 ]
// T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'b'                                     ), [ 1 ]
// T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'd'                                     ), [ 3 ]
// T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'e'                                     ), []
// T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', 'c', ], 'c'                                ), [ 2, 4 ]
// _find_all: ( list, value ) ->
//   ### TAINT comments to https://stackoverflow.com/a/20798567/7568091 suggest for-loop may be faster ###
//   R   = []
//   idx = -1
//   R.push idx while ( idx = list.indexOf value, idx + 1 ) > -1
//   return R

}).call(this);

//# sourceMappingURL=phrase-parser.js.map