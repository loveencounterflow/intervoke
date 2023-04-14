(function() {
  'use strict';
  var GUY, Intertype, base_types, debug, echo, get_base_types, inspect, log, misfit, rpr;

  //###########################################################################################################
  GUY = require('guy');

  // { alert
  //   debug
  //   help
  //   info
  //   plain
  //   praise
  //   urge
  //   warn
  //   whisper }               = GUY.trm.get_loggers 'DATAMILL/TYPES'
  ({debug} = GUY.trm.get_loggers('INTERVOKE/TYPES'));

  ({rpr, inspect, echo, log} = GUY.trm);

  ({Intertype} = require('intertype'));

  base_types = null;

  misfit = Symbol('misfit');

  // PATH                      = require 'node:path'

  //-----------------------------------------------------------------------------------------------------------
  get_base_types = function() {
    var declare;
    if (base_types != null) {
      return base_types;
    }
    //.........................................................................................................
    base_types = new Intertype();
    ({declare} = base_types);
    //.........................................................................................................
    declare.ivk_registry('map');
    declare.word_prompter_cfg({
      fields: {},
      // registry:     'ivk_registry'
      template: {},
      // registry:     null
      create: function(x) {
        var R;
        if ((x != null) && !!this.isa.object(x)) {
          return x;
        }
        R = {...this.registry.word_prompter_cfg.template, ...x};
        // R.registry ?= new Map()
        return R;
      }
    });
    //.........................................................................................................
    return base_types;
  };

  //===========================================================================================================
  module.exports = {misfit, get_base_types};

}).call(this);

//# sourceMappingURL=types.js.map