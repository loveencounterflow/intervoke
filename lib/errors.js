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
  this.Undeclared_word = class Undeclared_word extends this.Guy_error_base_class {
    constructor(ref, sentence, word) {
      super(ref, `word ${rpr(word)} is unknown in ${rpr(sentence)}`);
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
  this.Empty_alternative_clause = class Empty_alternative_clause extends this.Guy_error_base_class {
    constructor(ref, sentence) {
      super(ref, `unexpected empty alternative clause in ${rpr(sentence)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Wrong_role = class Wrong_role extends this.Guy_error_base_class {
    constructor(ref, phrase, word, is_role, expect_role) {
      super(ref, `expected word ${rpr(word)} in phrase ${rpr(phrase)} to have role ${rpr(is_role)} but is declared to be ${rpr(expect_role)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Optional_not_first = class Optional_not_first extends this.Guy_error_base_class {
    constructor(ref, sentence) {
      super(ref, `expected 'optional' to occur as first word in phrase, got ${rpr(sentence)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Nested_containers = class Nested_containers extends this.Guy_error_base_class {
    constructor(ref, sentence) {
      super(ref, `nested containers not allowed in ${rpr(sentence)}`);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Container_with_alternatives = class Container_with_alternatives extends this.Guy_error_base_class {
    constructor(ref, sentence) {
      super(ref, `alternatives not allowed with containers in ${rpr(sentence)}`);
    }

  };

}).call(this);

//# sourceMappingURL=errors.js.map