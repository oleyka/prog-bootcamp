define(
  [
    'components/flight/lib/component'
  ],

  function(def)  {

    return def(text);

    function text() {

      function showText(txt) {
        this.$node.text(txt); 
      }

      function updateTime() { 
          var now = new Date();
          this.attr.text = now.getHours() + ":" + now.getMinutes() + ':' + now.getSeconds();
          this.$node.text(this.attr.text);
      }

      this.defaultAttrs({ text: "Click that button for time ->" });

      this.after('initialize', function() {
        this.$node.text(this.attr.text);
        this.on('update', updateTime);
      });
    }
  }
);