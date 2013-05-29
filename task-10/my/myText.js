define(
  [
    'components/flight/lib/component'
  ],

  function(def)  {

    return def(text);

    function text() {      
      this.defaultAttrs({ text: "Click that button for time ->" });

      this.showText = function() {
        console.log("c");
        this.$node.text(this.attr.text);
      }

      this.updateTime = function() { 
        console.log("b");
        var now = new Date();
        this.attr.text = now.getHours() + ":" + now.getMinutes() + ':' + now.getSeconds();
        this.showText();
      }

      this.after('initialize', function() {
        console.log("a");
        this.showText();
        this.on('update', this.updateTime);
      });
      console.log('000');
    }
  }
);