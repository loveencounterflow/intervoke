

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
  set:      { role: 'noun', adjectives: [ 'empty', 'nonempty',      ], }
  text:     { role: 'noun', adjectives: [ 'empty', 'nonempty',      ], }
  list:     { role: 'noun', adjectives: [ 'empty', 'nonempty',      ], }
  integer:  { role: 'noun', adjectives: [ 'positive', 'negative',   ], }


#===========================================================================================================
@Phrase_parser = class Phrase_parser

  #---------------------------------------------------------------------------------------------------------
  parse: ( sentence ) ->
    words           = sentence.split '_'
    alternatives    = []
    R               = { alternatives, optional: false, }
    has_container   = false
    #.......................................................................................................
    for disjunct from @_walk_disjuncts words
      depth = -1
      for element_clause from @_walk_element_clauses disjunct
        depth++
        #...................................................................................................
        { phrase }    = element_clause
        if phrase.length is 0
          throw new E.Empty_alternative_clause '^Phrase_parser.parse@1^', sentence
        noun          = phrase.at -1
        noun_entry    = @_get_vocabulary_entry phrase, noun, 'noun'
        #...................................................................................................
        alternative             = { noun, }
        adjectives              = @_get_adjectives R, phrase
        alternative.adjectives  = adjectives if adjectives.length > 0
        if element_clause.elements?
          if element_clause.elements.elements?
            throw new E.Nested_elements_clause '^Phrase_parser.parse@2^', sentence
          has_container                   = true
          { phrase: lphrase }             = element_clause.elements
          ladjectives                     = @_get_adjectives R, lphrase
          alternative.elements            = { noun: ( lphrase.at -1 ), }
          alternative.elements.adjectives = ladjectives if ladjectives.length > 0
        alternatives.push alternative if depth is 0
    #.......................................................................................................
    if has_container and R.alternatives.length > 1
      throw new E.Container_with_alternatives '^Phrase_parser.parse@3^', sentence
    # help '^Phrase_parser.parse@2^', rpr sentence
    # debug '^Phrase_parser.parse@2^', { has_container, }, R.alternatives.length
    #.......................................................................................................
    return R

  #---------------------------------------------------------------------------------------------------------
  _$walk_disjuncts: ( declaration ) ->
    ### assuming no empty strings ###
    disjunct_lst = []
    for word in declaration
      if word is 'or'
        yield disjunct_lst
        disjunct_lst = []
        continue
      disjunct_lst.push word
    yield disjunct_lst
    return null

  #---------------------------------------------------------------------------------------------------------
  _walk_disjuncts: ( words ) ->
    for disjunct_lst from @_$walk_disjuncts words
      if disjunct_lst.length is 0
        declaration = words.join ' '
        throw new E.Empty_alternative_clause '^Phrase_parser._walk_disjuncts@1^', declaration
      yield disjunct_lst
    return null

  #---------------------------------------------------------------------------------------------------------
  _get_vocabulary_entry: ( phrase, word, role = null ) ->
    unless ( R = vocabulary[ word ] )?
      phrase_txt = phrase.join '_'
      throw new E.Undeclared_word '^Phrase_parser._get_vocabulary_entry@1^', phrase_txt, word
    if role? and R.role isnt role
      phrase_txt = phrase.join '_'
      throw new E.Wrong_role '^Phrase_parser._get_vocabulary_entry@1^', phrase_txt, word, role, R.role
    return R

  #---------------------------------------------------------------------------------------------------------
  _get_adjectives: ( ast, phrase ) ->
    R = []
    for adjective, idx in phrase
      break if idx >= phrase.length - 1
      if adjective is 'optional'
        unless idx is 0
          phrase_txt = phrase.join '_'
          throw new E.Optional_not_first '^Phrase_parser._get_adjectives@1', phrase_txt
        ast.optional = true
        continue
      @_get_vocabulary_entry phrase, adjective, 'adjective'
      R.push adjective
    return R

  #---------------------------------------------------------------------------------------------------------
  _find_element_clauses: ( words ) ->
    R = { phrase: [], }
    for word, idx in words
      if word is 'or'
        clause = words.join '_'
        throw new E.Not_allowed_to_use_or_in_element_clause '^Phrase_parser._find_element_clauses^', clause
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


