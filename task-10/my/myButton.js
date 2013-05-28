define(
  [
    'components/flight/lib/component'
  ],

  function(def)  {

    return def(button);

    function button() {

      function updateText() { 
          this.trigger('#myText', 'update');
      }
      this.defaultAttrs({ value: 'Click me for time' });

      this.after('initialize', function() {
        this.node.value = this.attr.value;
        this.on('click', updateText);
      });
    }
  }
);