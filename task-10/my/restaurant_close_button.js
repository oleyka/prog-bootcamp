define(
  [
    'components/flight/lib/component'
  ],

  function(def) {

    return def(Close);

    function Close() {      
      this.after('initialize', function() {
        this.on('click', this.trigger('.rClass', 'stateClose'));
      });
    }
  }
);