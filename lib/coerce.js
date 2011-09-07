(function(undefined) {
  function rescue(coerce, msgKey, val) {
    if (coerce.defaultAssigned) {
      return coerce.defaultValue;
    } else if (val) {
      throw Coerce.errors[msgKey] + ' ' + val;
    } else {
      throw Coerce.errors[msgKey];
    }
  }

  function Coerce() {
    this.converters = [];
  }

  Coerce.errors = {
    "NaN": "value not a number",
    "undefined": "value is undefined",
    "null": "value is null",
    "min": "value must be greater than",
    "max": "value must be less than",
    "minLength": "value must be longer than",
    "maxLength": "value must be shorter than",
    "email": "value is not an email address"
  };

  Coerce.prototype.default = function(d) {
    this.defaultAssigned = true;
    this.defaultValue = d;
    return this;
  };

  Coerce.prototype._add = function(converter) {
    this.converters.push(converter);
  };

  Coerce.prototype.email = function() {
    this._add(function() {
      if (!emailRegex.exec(this.value)) {
        this.value = rescue(this, "email");
      }
    });
    return this;
  };

  Coerce.prototype.strip = function(regex) {
    this._add(function() {
      if (regex && regex.constructor === RegExp) {
        this.value = this.value.replace(regex, '');
      } else {
        this.value = this.value.replace(/^\s+/, '').replace(/\s+$/, '');
      }
    });
    return this;
  };

  Coerce.prototype.squish = function() {
    this._add(function() {
      this.value = this.value.replace(/\s+/g, ' ');
    });
    return this;
  };

  Coerce.prototype.squeeze = Coerce.prototype.squish;

  var htmlEscapes = {'&': '&amp', '"': '&quot;', '>': '&gt;', '<': '&lt;'};
  Coerce.prototype.htmlEscape = function() {
    this._add(function() {
      this.value = this.value.replace(/[&\"><]/g, function(x) {return htmlEscapes[x]});
    });
    return this;
  };

  Coerce.prototype.truncate = function(length, omission) {
    this._add(function() {
      if (this.value > length) {
        this.value = this.value.slice(0, length);
      }
      if (omission) {
        this.value = this.value + omission;
      }
    });
    return this;
  };

  Coerce.prototype.capitalizeEachWord = function() {
    this._add(function() {
      this.value = this.value.replace(/\w+/g, function(y) {
        return y.replace(/^\w/g, function(x) {
          return x.toUpperCase();
        });
      });
    });
    return this;
  };

  Coerce.prototype.capitalize = function() {
    this._add(function() {
      this.value = this.value.replace(/^\w/g, function(x) {
        return x.toUpperCase();
      });
    });
    return this;
  };

  Coerce.prototype.round = function(precision) {
    this._add(function() {
      if (precision) {
        var magnitude = Math.pow(10, precision);
        this.value = Math.round(this.value * magnitude) / magnitude;
      } else {
        this.value = Math.round(this.value);
      }
    });
    return this;
  };

  Coerce.prototype.floor = function() {
    this._add(function() {
      this.value = Math.floor(this.value);
    });
    return this;
  };

  Coerce.prototype.ceil = function() {
    this._add(function() {
      this.value = Math.ceil(this.value);
    });
    return this;
  };

  Coerce.prototype.int = function() {
    this._add(function() {
      this.value = parseInt(this.value);
      if (isNaN(this.value)) {
        this.value = rescue(this, "NaN");
      }
    });
    return this;
  };

  Coerce.prototype.float = function() {
    this._add(function() {
      this.value = parseFloat(this.value);
      if (isNaN(this.value)) {
        this.value = rescue(this, "NaN");
      }
    });
    return this;
  };

  Coerce.prototype.min = function(x) {
    this._add(function() {
      if (this.value) {
        if (this.value.constructor === Date && x.constructor === Date && this.value.getTime() < x.getTime()) {
          this.value = rescue(this, "minDate", x);
        } else if (this.value.constructor === String && this.value.length < x) {
          this.value = rescue(this, "minLength", x);
        } else if (this.value < x) {
          this.value = rescue(this, "min", x);
        }
      } else {
        this.value = rescue(this, "null", x);
      }
    });
    return this;
  };

  Coerce.prototype.greaterThan = Coerce.prototype.min;

  Coerce.prototype.max = function(x) {
    this._add(function() {
      if (this.value) {
        if (this.value.constructor === Date && x.constructor === Date && this.value.getTime() > x.getTime()) {
          this.value = rescue(this, "maxDate", x);
        } else if (this.value.constructor === String && this.value.length > x) {
          this.value = rescue(this, "maxLength", x);
        } else if (this.value > x) {
          this.value = rescue(this, "max", x);
        }
      } else {
        this.value = rescue(this, "null", x);
      }
    });
    return this;
  };

  Coerce.prototype.lessThan = Coerce.prototype.max;

  Coerce.prototype.str = function() {
    this._add(function() {
      if (this.value === null) {
        this.value = rescue(this, "null");
      } else if (this.value === undefined) {
        this.value = rescue(this, "undefined");
      } else {
        this.value = this.value.toString();
      }
    });
    return this;
  };

  // alias
  Coerce.prototype.string = Coerce.prototype.str;

  Coerce.prototype.coerce = function(value) {
    this.value = value;
    for(var i in this.converters) {
      var converter = this.converters[i];
      if (converter) {
        converter.call(this);
      }
    }
    return this.value;
  }

  if (exports) {
    // exports.coerce = function() {
    //   return new Coerce();
    // }
    module.exports = function() {
      return new Coerce();
    }
  } else if (window) {
    window.coerce = function() {
      return new Coerce();
    }
  }

  var emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
})();
