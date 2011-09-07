var assert = require('assert')
  , c = require('coerce');

module.exports = {
    'int parsing': function() {
      var i = c().int();
      assert.equal(123, i.coerce('123'));
      assert.equal(3, i.default(3).coerce('abc'));
    },

    'string stripping': function() {
      var s = c().str();
      assert.equal('123', s.coerce(123));
      assert.equal('1.23423', s.coerce(1.23423));
    },

    'email': function() {
      var e = c().strip().email().default(undefined);
      assert.equal('john@example.com', e.coerce('   john@example.com   '));
      assert.isUndefined(e.coerce('this is not an email'));
    },

    'html escaping': function() {
      var h = c().htmlEscape();
      assert.equal('&lt;body&gt;', h.coerce('<body>'));
    },

    'capitalizing': function() {
      var i = c().capitalize();
      assert.equal('Brian may', i.coerce('brian may'));
      assert.equal('Brian May', i.capitalizeEachWord().coerce('brian may'));
    },

    'rounding': function() {
      assert.equal(1.23, c().round(2).coerce(1.23456));
      assert.equal(5, c().round().coerce(5.234233));
    },

    'min and max': function() {
      var m = c().min(2).max(10).default(null);
      assert.isNull(m.coerce(11));
      assert.isNull(m.coerce(1));
      assert.isNotNull(m.coerce(4));
    }
};
