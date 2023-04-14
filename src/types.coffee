
'use strict'


############################################################################################################
GUY                       = require 'guy'
# { alert
#   debug
#   help
#   info
#   plain
#   praise
#   urge
#   warn
#   whisper }               = GUY.trm.get_loggers 'DATAMILL/TYPES'
{ debug }                 = GUY.trm.get_loggers 'INTERVOKE/TYPES'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
{ Intertype }             = require 'intertype'
base_types                = null
misfit                    = Symbol 'misfit'
# PATH                      = require 'node:path'


#-----------------------------------------------------------------------------------------------------------
get_base_types = ->
  return base_types if base_types?
  #.........................................................................................................
  base_types                = new Intertype()
  { declare }               = base_types
  #.........................................................................................................
  declare.ivk_registry 'map'
  declare.word_prompter_cfg
    fields: {}
      # registry:     'ivk_registry'
    template: {}
      # registry:     null
    create: ( x ) ->
      return x if x? and not not @isa.object x
      R           = { @registry.word_prompter_cfg.template..., x..., }
      # R.registry ?= new Map()
      return R
  #.........................................................................................................
  return base_types



#===========================================================================================================
module.exports = { misfit, get_base_types, }



