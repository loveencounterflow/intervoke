
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

#-----------------------------------------------------------------------------------------------------------
class Not_allowed_to_redeclare extends Guy_error_base_class
  constructor: ( ref, accessor ) -> super ref, "property #{rpr accessor} already declared"


#===========================================================================================================
@Prompter = class Prompter extends Function

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  #---------------------------------------------------------------------------------------------------------
  @create_proxy: ( x ) -> new Proxy x,
    get: ( target, accessor, receiver ) ->
      return target[ accessor ] if Reflect.has target, accessor
      return target[ accessor ] if ( typeof accessor ) isnt 'string'
      return target[ accessor ] if accessor.startsWith '_'
      return ( P... ) -> target accessor, P...

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    ### Trick to make this work; these are strings containing JS code: ###
    super '...P', 'return this.__me.__do(...P)'
    @__me         = @__nameit '__me', @bind @
    return clasz.create_proxy @__me

  #---------------------------------------------------------------------------------------------------------
  __walk_prototype_chain: ->
    R = []
    for object in ( GUY.props.get_prototype_chain @constructor ).reverse()
      yield object if @__types.is_extension_of object, clasz
    yield @
    return null

  #---------------------------------------------------------------------------------------------------------
  __do: ( P... ) ->
    ### Prompter instances are functions, and the `__do()` method is the code that they execute when being
    called. This method should be overridden in derived classes. ###
    throw new Wrong_use_of_abstract_base_class_method '^Prompter.__do^', @, '__do'

  #---------------------------------------------------------------------------------------------------------
  __nameit: ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f


#===========================================================================================================
@Word_prompter = class Word_prompter extends Prompter

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    GUY.props.hide @, '__types',      get_base_types()
    GUY.props.hide @, '__cfg',        @__types.create.word_prompter_cfg cfg
    GUY.props.hide @, '__accessors',  new Set()
    @__absorb_declarations()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  __absorb_declarations: ->
    for object from @__walk_prototype_chain()
      continue unless Reflect.has object, 'declare'
      @__declare accessor, handler for accessor, handler of object.declare

  #---------------------------------------------------------------------------------------------------------
  __do: ( accessor, details... ) -> ( @__get_handler accessor ) details...


  #---------------------------------------------------------------------------------------------------------
  __get_ncc_and_phrase: ( accessor ) ->
    ### Given an accessor (string), return its normalized version (NCC) and the corresponding phrase: ###
    phrase  = accessor.split /[\s_]+/u
    ncc     = phrase.join '_'
    return [ ncc, phrase, ]

  #---------------------------------------------------------------------------------------------------------
  __declare: ( accessor, handler ) ->
    ### Associate an accessor with a handler method: ###
    throw new Not_allowed_to_redeclare '^__declare@1^', accessor if Reflect.has @, accessor
    @__accessors.add accessor
    @__nameit accessor, handler
    GUY.props.hide @, accessor, handler
    return null


#===========================================================================================================
@Phrasal_prompter = class Phrasal_prompter extends Word_prompter

  #---------------------------------------------------------------------------------------------------------
  __declare: ( accessor, handler ) ->
    debug '^54-1^', { accessor, handler, }

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
  __create_handler: ( accessor ) ->
    throw new Not_allowed_to_use_undeclared '^Word_prompter.__create_handler^', @, accessor

