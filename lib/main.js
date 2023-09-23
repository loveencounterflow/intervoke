(function() {
  'use strict';
  var E, GUY, Phrase_parser, Phrase_prompter, Prompter, Word_prompter, debug, get_base_types, help, info, rpr, urge, warn;

  //===========================================================================================================
  GUY = require('guy');

  ({debug, info, warn, urge, help} = GUY.trm.get_loggers('INTERVOKE'));

  ({rpr} = GUY.trm);

  ({get_base_types} = require('./types'));

  E = require('./errors');

  ({Phrase_parser} = require('./phrase-parser'));

  //===========================================================================================================
  this.Prompter = Prompter = (function() {
    var clasz;

    class Prompter {
      //---------------------------------------------------------------------------------------------------------
      static create_proxy(x) {
        return new Proxy(x, {
          get: function(target, accessor, receiver) {
            if (Reflect.has(target, accessor)) {
              return target[accessor];
            }
            if ((typeof accessor) !== 'string') {
              return target[accessor];
            }
            if (accessor.startsWith('_')) {
              return target[accessor];
            }
            if (Reflect.has(target, '__get_handler')) {
              return target.__get_handler(accessor);
            }
            throw new E.Unknown_accessor('^Prompter/proxy.get^', accessor);
          }
        });
      }

      //---------------------------------------------------------------------------------------------------------
      constructor() {
        return clasz.create_proxy(this);
      }

      //---------------------------------------------------------------------------------------------------------
      * __walk_prototype_chain() {
        var R, i, len, object, ref;
        R = [];
        ref = (GUY.props.get_prototype_chain(this.constructor)).reverse();
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          if (this.__types.is_extension_of(object, clasz)) {
            yield object;
          }
        }
        yield this;
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      __nameit(name, f) {
        Object.defineProperty(f, 'name', {
          value: name
        });
        return f;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    clasz = Prompter;

    return Prompter;

  }).call(this);

  //===========================================================================================================
  this.Word_prompter = Word_prompter = class Word_prompter extends Prompter {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super();
      GUY.props.hide(this, '__types', get_base_types());
      GUY.props.hide(this, '__cfg', this.__types.create.word_prompter_cfg(cfg));
      GUY.props.hide(this, '__accessors', new Set());
      this.__absorb_declarations();
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    __absorb_declarations() {
      var accessor, handler, object, ref, ref1;
      ref = this.__walk_prototype_chain();
      for (object of ref) {
        if (!Reflect.has(object, 'declare')) {
          continue;
        }
        ref1 = object.declare;
        for (accessor in ref1) {
          handler = ref1[accessor];
          this.__declare(accessor, handler);
        }
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    __declare(accessor, handler) {
      if (Reflect.has(this, accessor)) {
        /* Associate an accessor with a handler method: */
        throw new E.Not_allowed_to_redeclare('^Word_prompter::__declare@1^', accessor);
      }
      this.__accessors.add(accessor);
      this.__nameit(accessor, handler);
      GUY.props.hide(this, accessor, handler);
      return null;
    }

  };

  //===========================================================================================================
  this.Phrase_prompter = Phrase_prompter = class Phrase_prompter extends Word_prompter {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg = null) {
      super(cfg);
      GUY.props.hide(this, '__parser', new Phrase_parser());
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    __declare(accessor, handler) {
      debug('^Phrase_prompter::__declare@1^', {accessor, handler});
      super.__declare(accessor, handler);
      return null;
    }

    // #---------------------------------------------------------------------------------------------------------
    // __get_ncc_and_phrase: ( accessor ) ->
    //   throw new E.Error "__get_ncc_and_phrase() under construction"
    //   ### Given an accessor (string), return its normalized version (NCC) and the corresponding phrase: ###
    //   phrase  = accessor.split /[\s_]+/u
    //   ncc     = phrase.join '_'
    //   return [ ncc, phrase, ]

      //---------------------------------------------------------------------------------------------------------
    __get_handler(accessor) {
      /* Given a accessor, returns a method to use for that accessor, either from cache a newly generated by
         calling `__create_handler()` which must be declared in derived classes. When used with alternative
         accessors, care has been taken to only call `__create_handler()` once and to cache alternative accessors
         along with the normalized one. */
      var R, ast, ncc, phrase;
      ast = this.__parser.parse(accessor);
      debug('^Phrase_prompter::__get_handler@1^', {accessor, ast});
      throw new Error("__get_handler() under construction");
      if ((R = this[accessor]) !== void 0/* NOTE repeat from proxy */) {
        return R;
      }
      //.......................................................................................................
      [ncc, phrase] = this.__get_ncc_and_phrase(accessor);
      if ((R = this[ncc]) !== void 0) {
        GUY.props.hide(this, accessor, R);
        return R;
      }
      //.......................................................................................................
      R = this.__nameit(ncc, this.__create_handler(phrase));
      this.__declare(ncc, R);
      if (accessor !== ncc) {
        this.__declare(accessor, R);
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    __create_handler(accessor) {
      throw new E.Not_allowed_to_use_undeclared('^Phrase_prompter::__create_handler^', this, accessor);
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map