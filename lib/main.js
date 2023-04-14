(function() {
  'use strict';
  var GUY, Guy_error_base_class, Not_allowed_to_redeclare, Phrasal_prompter, Prompter, Word_prompter, Wrong_use_of_abstract_base_class_method, debug, get_base_types, help, info, rpr, urge, warn;

  //===========================================================================================================
  GUY = require('guy');

  ({debug, info, warn, urge, help} = GUY.trm.get_loggers('INTERVOKE'));

  ({rpr} = GUY.trm);

  ({get_base_types} = require('./types'));

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT move this to Guy */
  Guy_error_base_class = class Guy_error_base_class extends Error {
    constructor(ref, message) {
      super();
      if (ref === null) {
        this.message = message;
        return void 0;
      }
      this.message = `${ref} (${this.constructor.name}) ${message}`;
      this.ref = ref;
      return void 0/* always return `undefined` from constructor */;
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  Wrong_use_of_abstract_base_class_method = class Wrong_use_of_abstract_base_class_method extends Guy_error_base_class {
    constructor(ref, instance, method_name) {
      var class_name;
      class_name = instance.constructor.name;
      super(ref, `not allowed to call method ${rpr(method_name)} of abstract base class ${rpr(class_name)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  Not_allowed_to_redeclare = class Not_allowed_to_redeclare extends Guy_error_base_class {
    constructor(ref, accessor) {
      super(ref, `property ${rpr(accessor)} already declared`);
    }

  };

  //===========================================================================================================
  this.Prompter = Prompter = (function() {
    var clasz;

    class Prompter extends Function {
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
            return function(...P) {
              return target(accessor, ...P);
            };
          }
        });
      }

      //---------------------------------------------------------------------------------------------------------
      constructor() {
        /* Trick to make this work; these are strings containing JS code: */
        super('...P', 'return this.__me.__do(...P)');
        this.__me = this.__nameit('__me', this.bind(this));
        return clasz.create_proxy(this.__me);
      }

      //---------------------------------------------------------------------------------------------------------
      * __walk_prototype_chain() {
        var R, i, len, object, ref1;
        R = [];
        ref1 = (GUY.props.get_prototype_chain(this.constructor)).reverse();
        for (i = 0, len = ref1.length; i < len; i++) {
          object = ref1[i];
          if (this.__types.is_extension_of(object, clasz)) {
            yield object;
          }
        }
        yield this;
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      __do(...P) {
        /* Prompter instances are functions, and the `__do()` method is the code that they execute when being
           called. This method should be overridden in derived classes. */
        throw new Wrong_use_of_abstract_base_class_method('^Prompter.__do^', this, '__do');
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
      var accessor, handler, object, ref1, results;
      ref1 = this.__walk_prototype_chain();
      results = [];
      for (object of ref1) {
        if (!Reflect.has(object, 'declare')) {
          continue;
        }
        results.push((function() {
          var ref2, results1;
          ref2 = object.declare;
          results1 = [];
          for (accessor in ref2) {
            handler = ref2[accessor];
            results1.push(this.__declare(accessor, handler));
          }
          return results1;
        }).call(this));
      }
      return results;
    }

    //---------------------------------------------------------------------------------------------------------
    __do(accessor, ...details) {
      return (this.__get_handler(accessor))(...details);
    }

    //---------------------------------------------------------------------------------------------------------
    __get_handler(accessor) {
      var R, ncc, phrase;
      if ((R = this[accessor]) !== void 0/* NOTE repeat from proxy */) {
        /* Given a accessor, returns a method to use for that accessor, either from cache a newly generated by
           calling `__create_handler()` which must be declared in derived classes. When used with alternative
           accessors, care has been taken to only call `__create_handler()` once and to cache alternative accessors
           along with the normalized one. */
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
    __create_handler(phrase) {
      /* Given a phrase (the parts of an accessor when split), return a function that takes details as
         arguments and returns a resolution. */
      throw new Wrong_use_of_abstract_base_class_method('^Word_prompter.__create_handler^', this, '__create_handler');
    }

    //---------------------------------------------------------------------------------------------------------
    __get_ncc_and_phrase(accessor) {
      /* Given an accessor (string), return its normalized version (NCC) and the corresponding phrase: */
      var ncc, phrase;
      phrase = accessor.split(/[\s_]+/u);
      ncc = phrase.join('_');
      return [ncc, phrase];
    }

    //---------------------------------------------------------------------------------------------------------
    __declare(accessor, handler) {
      if (Reflect.has(this, accessor)) {
        /* Associate an accessor with a handler method: */
        throw new Not_allowed_to_redeclare('^__declare@1^', accessor);
      }
      this.__accessors.add(accessor);
      this.__nameit(accessor, handler);
      GUY.props.hide(this, accessor, handler);
      return null;
    }

  };

  //===========================================================================================================
  this.Phrasal_prompter = Phrasal_prompter = class Phrasal_prompter extends Word_prompter {
    //---------------------------------------------------------------------------------------------------------
    __declare(accessor, handler) {
      return debug('^54-1^', {accessor, handler});
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map