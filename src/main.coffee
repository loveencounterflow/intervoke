
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
E                         = require './errors'
{ Phrase_parser }         = require './phrase-parser'


#===========================================================================================================
@Intervoke_proxy = class Intervoke_proxy

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  #---------------------------------------------------------------------------------------------------------
  @create_proxy: ( x ) -> new Proxy x,
    get: ( target, accessor, receiver ) =>
      ### Return handler for given `accessor`. If instance doesn't have property `accessor` and instance has
      `__get_handler()`, call that method with `accessor`, set property `accessor` and return handler. In
      case instance has `__parser`, get `ast` as` `__parser.parse accessor` and call `__get_handler()` with
      `ast` as second argument. `__get_handler()` will only be called if `accessor` is a string that does
      not start with an underscore. ###
      return target[ accessor ] if Reflect.has target, accessor
      return target[ accessor ] if ( typeof accessor ) isnt 'string'
      return target[ accessor ] if accessor.startsWith '_'
      if Reflect.has target, '__get_handler'
        ast = if ( Reflect.has target, '__parser' ) then target.__parser.parse accessor else null
        if ( R = target.__get_handler accessor, ast )?
          R = target.__nameit '###' + accessor, R
          GUY.props.hide target, accessor, R
          return R
      throw new E.Unknown_accessor '^Intervoke_proxy/proxy.get@1^', accessor

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    return clasz.create_proxy @

  #---------------------------------------------------------------------------------------------------------
  __nameit: ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f


#===========================================================================================================
@Intervoke = class Intervoke extends Intervoke_proxy

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    GUY.props.hide @, '__types',      get_base_types()
    GUY.props.hide @, '__cfg',        @__types.create.word_prompter_cfg cfg
    GUY.props.hide @, '__accessors',  new Set()
    @__absorb_declarations()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  __walk_prototype_chain: ->
    R = []
    for object in ( GUY.props.get_prototype_chain @constructor ).reverse()
      yield object if @__types.is_extension_of object, clasz
    yield @
    return null

  #---------------------------------------------------------------------------------------------------------
  __absorb_declarations: ->
    for object from @__walk_prototype_chain()
      continue unless Reflect.has object, 'declare'
      @__declare accessor, handler for accessor, handler of object.declare
    return null

  #---------------------------------------------------------------------------------------------------------
  __declare: ( accessor, handler ) ->
    ### Associate an accessor with a handler method: ###
    throw new E.Not_allowed_to_redeclare '^Intervoke::__declare@1^', accessor if Reflect.has @, accessor
    @__accessors.add accessor
    @__nameit @constructor.name.toLowerCase() + '_' + accessor, handler
    GUY.props.hide @, accessor, handler
    return null


#===========================================================================================================
@Intervoke_phraser = class Intervoke_phraser extends Intervoke

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg = null ) ->
    super cfg
    GUY.props.hide @, '__parser', new Phrase_parser()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  __get_handler: ( accessor, ast ) ->
    ### Given a accessor, returns a method to use for that accessor, either from cache a newly generated by
    calling `__create_handler()` which must be declared in derived classes. When used with alternative
    accessors, care has been taken to only call `__create_handler()` once and to cache alternative accessors
    along with the normalized one. ###
    # ast = @__parser.parse accessor
    debug '^Intervoke_phraser::__get_handler@1^', "accessor:  ", accessor
    debug '^Intervoke_phraser::__get_handler@1^', "ast:       ", ast
    throw new Error "override Intervoke_phraser::__get_handler() to implement your own Intervoke proxy"

