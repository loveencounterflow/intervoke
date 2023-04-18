

'use strict'



#===========================================================================================================
GUY                       = require 'guy'
{ debug
  info
  warn
  urge
  help }                  = GUY.trm.get_loggers 'INTERVOKE/PROMPT-PARSER'
{ rpr }                   = GUY.trm
{ get_base_types }        = require './types'
E                         = require './errors'



#===========================================================================================================
vocabulary  =
  of:       { role: 'of',         }
  or:       { role: 'or',         }
  optional: { role: 'optional',   }
  #.......................................................................................................
  empty:    { role: 'adjective',  }
  nonempty: { role: 'adjective',  }
  positive: { role: 'adjective',  }
  negative: { role: 'adjective',  }
  #.......................................................................................................
  text:     { role: 'noun', adjectives: [ 'empty', 'nonempty',      ], }
  list:     { role: 'noun', adjectives: [ 'empty', 'nonempty',      ], }
  integer:  { role: 'noun', adjectives: [ 'positive', 'negative',   ], }


#===========================================================================================================
@Phrase_parser = class Phrase_parser

  #---------------------------------------------------------------------------------------------------------
  parse: ( sentence ) ->
    words           = sentence.split '_'
    element_clauses = @_find_element_clauses words
    # debug '^99-1^', element_clauses
    alternatives    = []
    R               = { alternatives, optional: false, }
    for phrase from @_walk_alternative_phrases words
      #.....................................................................................................
      noun          = phrase.at -1
      noun_entry    = @_get_vocabulary_entry phrase, noun, 'noun'
      #.....................................................................................................
      ### NOTE not entirely correct, must look for 'of' ###
      adjectives    = @_get_adjectives R, phrase
      alternative   = { noun, adjectives, }
      alternatives.push alternative
    return R

  #---------------------------------------------------------------------------------------------------------
  _$walk_alternative_phrases: ( sentence ) ->
    ### assuming no empty strings ###
    phrase    = []
    for word in sentence
      if word is 'or'
        yield phrase
        phrase = []
        continue
      phrase.push word
    yield phrase
    return null

  #---------------------------------------------------------------------------------------------------------
  _walk_alternative_phrases: ( words ) ->
    for phrase from @_$walk_alternative_phrases words
      sentence = words.join ' '
      throw new Error "empty alternative clause in sentence #{rpr sentence}" if phrase.length is 0
      yield phrase
    return null

  #---------------------------------------------------------------------------------------------------------
  _get_vocabulary_entry: ( phrase, word, role = null ) ->
    unless ( R = vocabulary[ word ] )?
      phrase_txt = phrase.join '_'
      throw new Error "word #{rpr word} in phrase #{rpr phrase_txt} is unknown"
    if role? and R.role isnt role
      phrase_txt = phrase.join '_'
      throw new Error "expected word #{rpr word} in phrase #{rpr phrase_txt} to have role #{rpr role} but is declared to be #{rpr R.role}"
    return R

  #---------------------------------------------------------------------------------------------------------
  _get_adjectives: ( ast, phrase ) ->
    R = []
    for adjective, idx in phrase
      break if idx >= phrase.length - 1
      if adjective is 'optional'
        unless idx is 0
          phrase_txt = phrase.join '_'
          throw new Error "expected 'optional' to occur as first word in phrase, got #{rpr phrase_txt}"
        ast.optional = true
        continue
      @_get_vocabulary_entry phrase, adjective, 'adjective'
      R.push adjective
      return R

  #---------------------------------------------------------------------------------------------------------
  _find_element_clauses: ( words ) ->
    R = { phrase: [], }
    for word, idx in words
      if word is 'of'
        R.elements = @_find_element_clauses words[ idx + 1 .. ]
        return R
      R.phrase.push word
    return R

  #---------------------------------------------------------------------------------------------------------
  _walk_element_clauses: ( words ) ->
    clause = @_find_element_clauses words
    yield from @_$walk_element_clauses clause
    return null

  #---------------------------------------------------------------------------------------------------------
  _$walk_element_clauses: ( clause ) ->
    yield clause
    yield from @_$walk_element_clauses clause.elements if clause.elements?
    return null

  # #---------------------------------------------------------------------------------------------------------
  # #.........................................................................................................
  ### NOTE likely not to be used: ###
  # T?.eq ( pp._find_all [ 'nonempty', 'list', 'of', 'list', 'of', 'text', ], 'of'        ), [ 2, 4 ]
  # T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'b'                                     ), [ 1 ]
  # T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'd'                                     ), [ 3 ]
  # T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', ], 'e'                                     ), []
  # T?.eq ( pp._find_all [ 'a', 'b', 'c', 'd', 'c', ], 'c'                                ), [ 2, 4 ]
  # _find_all: ( list, value ) ->
  #   ### TAINT comments to https://stackoverflow.com/a/20798567/7568091 suggest for-loop may be faster ###
  #   R   = []
  #   idx = -1
  #   R.push idx while ( idx = list.indexOf value, idx + 1 ) > -1
  #   return R


