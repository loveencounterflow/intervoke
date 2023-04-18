(function() {
  'use strict';
  var GUY, debug, get_base_types, help, info, rpr, urge, warn;

  //===========================================================================================================
  GUY = require('guy');

  ({debug, info, warn, urge, help} = GUY.trm.get_loggers('INTERVOKE'));

  ({rpr} = GUY.trm);

  ({get_base_types} = require('./types'));

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT move this to Guy */
  this.Guy_error_base_class = class Guy_error_base_class extends Error {
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
  this.Wrong_use_of_abstract_base_class_method = class Wrong_use_of_abstract_base_class_method extends this.Guy_error_base_class {
    constructor(ref, instance, method_name) {
      var class_name;
      class_name = instance.constructor.name;
      super(ref, `not allowed to call method ${rpr(method_name)} of abstract base class ${rpr(class_name)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Not_allowed_to_redeclare = class Not_allowed_to_redeclare extends this.Guy_error_base_class {
    constructor(ref, accessor) {
      super(ref, `property ${rpr(accessor)} already declared`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Unknown_accessor = class Unknown_accessor extends this.Guy_error_base_class {
    constructor(ref, accessor) {
      super(ref, `property ${rpr(accessor)} is unknown`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Not_allowed_to_use_undeclared = class Not_allowed_to_use_undeclared extends this.Guy_error_base_class {
    constructor(ref, accessor) {
      super(ref, `wrong use of undeclared property ${rpr(accessor)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Not_allowed_to_use_or_in_element_clause = class Not_allowed_to_use_or_in_element_clause extends this.Guy_error_base_class {
    constructor(ref, clause) {
      super(ref, `wrong use of 'or' in element clause ${rpr(clause)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Empty_alternative_phrase = class Empty_alternative_phrase extends this.Guy_error_base_class {
    constructor(ref, sentence) {
      super(ref, `unexpected empty alternative phrase in ${rpr(sentence)}`);
    }

  };

}).call(this);

//# sourceMappingURL=errors.js.map