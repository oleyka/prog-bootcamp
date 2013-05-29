define(
  [
    'components/flight/lib/component'
  ],

  function(def)  {

    return def(text);

    function text() {      
      this.defaultAttrs({ text: "Click that button for time ->" });

      this.showText = function() {
        this.$node.text(this.attr.text);
      }

      this.updateTime = function() { 
        var now = new Date();
        this.attr.text = now.getHours() + ":" + now.getMinutes() + ':' + now.getSeconds();
        this.showText();
      }

      this.after('initialize', function() {
        this.showText();
        this.on('update', this.updateTime);
      });
    }
  }
);