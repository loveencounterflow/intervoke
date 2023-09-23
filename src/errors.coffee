
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
class @Guy_error_base_class extends Error
  constructor: ( ref, message ) ->
    super()
    if ref is null
      @message  = message
      return undefined
    @message  = "#{ref} (#{@constructor.name}) #{message}"
    @ref      = ref
    return undefined ### always return `undefined` from constructor ###

#-----------------------------------------------------------------------------------------------------------
class @Wrong_use_of_abstract_base_class_method extends @Guy_error_base_class
  constructor: ( ref, instance, method_name )     ->
    class_name = instance.constructor.name
    super ref, "not allowed to call method #{rpr method_name} of abstract base class #{rpr class_name}"

#-----------------------------------------------------------------------------------------------------------
class @Not_allowed_to_redeclare extends @Guy_error_base_class
  constructor: ( ref, accessor ) -> super ref, "property #{rpr accessor} already declared"

#-----------------------------------------------------------------------------------------------------------
class @Unknown_accessor extends @Guy_error_base_class
  constructor: ( ref, accessor ) -> super ref, "property #{rpr accessor} is unknown"

#-----------------------------------------------------------------------------------------------------------
class @Not_allowed_to_use_undeclared extends @Guy_error_base_class
  constructor: ( ref, accessor ) -> super ref, "wrong use of undeclared property #{rpr accessor}"

#-----------------------------------------------------------------------------------------------------------
class @Not_allowed_to_use_or_in_element_clause extends @Guy_error_base_class
  constructor: ( ref, clause ) -> super ref, "wrong use of 'or' in element clause #{rpr clause}"

#-----------------------------------------------------------------------------------------------------------
class @Empty_alternative_phrase extends @Guy_error_base_class
  constructor: ( ref, sentence ) -> super ref, "unexpected empty alternative phrase in #{rpr sentence}"

#-----------------------------------------------------------------------------------------------------------
class @Nested_elements_clause extends @Guy_error_base_class
  constructor: ( ref, sentence ) -> super ref, "nested containers not allowed in #{rpr sentence}"

#-----------------------------------------------------------------------------------------------------------
class @Container_with_alternatives extends @Guy_error_base_class
  constructor: ( ref, sentence ) -> super ref, "alternatives not allowed with containers in #{rpr sentence}"
