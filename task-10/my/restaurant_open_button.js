define(
  [
    'components/flight/lib/component'
  ],

  function(def) {

    return def(Open);

    function Open() {      
      this.after('initialize', function() {
        this.on('click', this.trigger('.rClass', 'stateOpen'));
      });
    }
  }
);