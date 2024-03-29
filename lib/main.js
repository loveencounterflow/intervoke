(function() {
  'use strict';
  var E, GUY, Intervoke, Intervoke_phraser, Intervoke_proxy, Phrase_parser, debug, get_base_types, help, info, rpr, urge, warn;

  //===========================================================================================================
  GUY = require('guy');

  ({debug, info, warn, urge, help} = GUY.trm.get_loggers('INTERVOKE'));

  ({rpr} = GUY.trm);

  ({get_base_types} = require('./types'));

  E = require('./errors');

  ({Phrase_parser} = require('./phrase-parser'));

  //===========================================================================================================
  this.Intervoke_proxy = Intervoke_proxy = (function() {
    var clasz;

    class Intervoke_proxy {
      //---------------------------------------------------------------------------------------------------------
      static create_proxy(x) {
        return new Proxy(x, {
          get: (target, accessor, receiver) => {
            var R, ast;
            if (Reflect.has(target, accessor)) {
              /* Return handler for given `accessor`. If instance doesn't have property `accessor` and instance has
                   `__get_handler()`, call that method with `accessor`, set property `accessor` and return handler. In
                   case instance has `__parser`, get `ast` as` `__parser.parse accessor` and call `__get_handler()` with
                   `ast` as second argument. `__get_handler()` will only be called if `accessor` is a string that does
                   not start with an underscore. */
              return target[accessor];
            }
            if ((typeof accessor) !== 'string') {
              return target[accessor];
            }
            if (accessor.startsWith('_')) {
              return target[accessor];
            }
            if (Reflect.has(target, '__get_handler')) {
              ast = (Reflect.has(target, '__parser')) ? target.__parser.parse(accessor) : null;
              if ((R = target.__get_handler(accessor, ast)) != null) {
                R = target.__nameit('###' + accessor, R);
                GUY.props.hide(target, accessor, R);
                return R;
              }
            }
            throw new E.Unknown_accessor('^Intervoke_proxy/proxy.get@1^', accessor);
          }
        });
      }

      //---------------------------------------------------------------------------------------------------------
      constructor() {
        return clasz.create_proxy(this);
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
    clasz = Intervoke_proxy;

    return Intervoke_proxy;

  }).call(this);

  //===========================================================================================================
  this.Intervoke = Intervoke = (function() {
    var clasz;

    class Intervoke extends Intervoke_proxy {
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
          throw new E.Not_allowed_to_redeclare('^Intervoke::__declare@1^', accessor);
        }
        this.__accessors.add(accessor);
        this.__nameit(this.constructor.name.toLowerCase() + '_' + accessor, handler);
        GUY.props.hide(this, accessor, handler);
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    clasz = Intervoke;

    return Intervoke;

  }).call(this);

  //===========================================================================================================
  this.Intervoke_phraser = Intervoke_phraser = class Intervoke_phraser extends Intervoke {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg = null) {
      super(cfg);
      GUY.props.hide(this, '__parser', new Phrase_parser());
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    __get_handler(accessor, ast) {
      /* Given a accessor, returns a method to use for that accessor, either from cache a newly generated by
         calling `__create_handler()` which must be declared in derived classes. When used with alternative
         accessors, care has been taken to only call `__create_handler()` once and to cache alternative accessors
         along with the normalized one. */
      // ast = @__parser.parse accessor
      debug('^Intervoke_phraser::__get_handler@1^', "accessor:  ", accessor);
      debug('^Intervoke_phraser::__get_handler@1^', "ast:       ", ast);
      throw new Error("override Intervoke_phraser::__get_handler() to implement your own Intervoke proxy");
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map