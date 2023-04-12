
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
{ Dataclass }             = require 'datom'
base_types                = null
analyzing_attributor_types  = null
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
    fields:
      registry:     'ivk_registry'
    template:
      registry:     null
  #.........................................................................................................
  return base_types



#===========================================================================================================
module.exports = { misfit, get_base_types, }



