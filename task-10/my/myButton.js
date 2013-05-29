define(
  [
    'components/flight/lib/component'
  ],

  function(def)  {

    return def(button);

    function button() {
      this.defaultAttrs({ value: 'Click me for time' });

      this.updateText = function() { 
          this.trigger('#myText', 'update');
      }

      this.after('initialize', function() {
        this.updateText();

        this.node.value = this.attr.value;
        this.on('click', this.updateText);      
      });
    }
  }
);