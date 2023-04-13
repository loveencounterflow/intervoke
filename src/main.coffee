
'use strict'



#===========================================================================================================
GUY                       = require 'guy'
{ debug
  info
  warn
  urge
  help }                  = GUY.trm.get_loggers 'INTERVOKE'
{ rpr }                   = GUY.trm
{ get_base_types }        = require './types'


#-----------------------------------------------------------------------------------------------------------
### TAINT move this to Guy ###
class Guy_error_base_class extends Error
  constructor: ( ref, message ) ->
    super()
    if ref is null
      @message  = message
      return undefined
    @message  = "#{ref} (#{@constructor.name}) #{message}"
    @ref      = ref
    return undefined ### always return `undefined` from constructor ###

#-----------------------------------------------------------------------------------------------------------
class Wrong_use_of_abstract_base_class_method extends Guy_error_base_class
  constructor: ( ref, instance, method_name )     ->
    class_name = instance.constructor.name
    super ref, "not allowed to call method #{rpr method_name} of abstract base class #{rpr class_name}"


#===========================================================================================================
@Prompter = class Prompter extends Function

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  #---------------------------------------------------------------------------------------------------------
  @create_proxy: ( x ) -> new Proxy x,
    get: ( target, accessor, receiver ) ->
      return R unless ( R = target[ accessor ] ) is undefined
      return target[ accessor ] unless ( typeof accessor ) is 'string'
      return target[ accessor ] if accessor.startsWith '_'
      return ( P... ) -> target accessor, P...

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    ### Trick to make this work; these are strings containing JS code: ###
    super '...P', 'return this.__me.__do(...P)'
    @__me = @bind @
    return clasz.create_proxy @__me

  #---------------------------------------------------------------------------------------------------------
  __do: ( P... ) ->
    ### Prompter instances are functions, and the `__do()` method is the code that they execute when being
    called. This method should be overridden in derived classes. ###
    throw new Wrong_use_of_abstract_base_class_method '^Prompter.__do^', @, '__do'


#===========================================================================================================
@Word_prompter = class Word_prompter extends Prompter

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    GUY.props.hide @, '__types', get_base_types()
    @__cfg = @__types.create.word_prompter_cfg cfg
    return undefined

  #---------------------------------------------------------------------------------------------------------
  __do: ( accessor, details... ) -> ( @__get_handler accessor ) details...

  #---------------------------------------------------------------------------------------------------------
  __get_handler: ( accessor ) ->
    ### Given a accessor, returns a method to use for that accessor, either from cache a newly generated by
    calling `__create_handler()` which must be declared in derived classes. When used with alternative
    accessors, care has been taken to only call `__create_handler()` once and to cache alternative accessors
    along with the normalized one. ###
    return R unless ( R = @[ accessor ] ) is undefined ### NOTE repeat from proxy ###
    #.......................................................................................................
    [ ncc, phrase  ] = @__get_ncc_and_phrase accessor
    unless ( R = @[ ncc ] ) is undefined
      GUY.props.hide @, accessor, R
      return R
    #.......................................................................................................
    R = @__nameit ncc, @__create_handler phrase
    @__declare ncc,      R
    @__declare accessor, R if accessor isnt ncc
    return R

  #---------------------------------------------------------------------------------------------------------
  __create_handler: ( phrase ) ->
    ### Given a phrase (the parts of an accessor when split), return a function that takes details as
    arguments and returns a resolution. ###
    throw new Wrong_use_of_abstract_base_class_method '^Word_prompter.__create_handler^', @, '__create_handler'

  #---------------------------------------------------------------------------------------------------------
  __get_ncc_and_phrase: ( accessor ) ->
    ### Given an accessor (string), return a phrase (list of strings): ###
    phrase  = accessor.split /[\s_]+/u
    ncc     = phrase.join '_'
    return [ ncc, phrase, ]

  #---------------------------------------------------------------------------------------------------------
  __declare: ( accessor, handler ) ->
    ### Associate an accessor with a handler method: ###
    ### TAINT check for overwrites ###
    GUY.props.hide @, accessor, handler
    return null

  #---------------------------------------------------------------------------------------------------------
  __nameit: ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f


#===========================================================================================================
@Phrasal_prompter = class Phrasal_prompter extends Word_prompter

  #---------------------------------------------------------------------------------------------------------
  __declare: ( accessor, handler ) ->
    debug '^54-1^', { accessor, handler, }

