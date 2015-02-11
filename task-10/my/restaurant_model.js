define(
  [
    'components/flight/lib/component'
  ],

  function(def) {

    return def(Restaurant);

    function Restaurant() {      
      this.defaultAttrs({ 
        className: 'rClass',
        objectId: '', 
        currentOccupancy: 0,
        maxOccupancy: 0,
        name: '',
        state: 'closed',
        visitorsArray: [],
      });

      this.tmpl = _.template($("#restaurant-message").html());

      this.render = function() { 
        console.log('Rendering ' + this.attr.state);
        this.$node.html('<div class="' + this.attr.className + 
              ' ' + this.attr.className + this.attr.state + '">' + this.tmpl(this.attr) + '</div>');
      }

      this.open = function()
      {
        this.attr.state = 'open';
        this.render();
      }

      this.close = function()
      {
        this.attr.state = 'closed';
        this.render();
      }

      this.sync = function() {}

      this.after('initialize', function() {
        this.render();
        this.on('stateOpen', this.open);
        this.on('stateClose', this.close);
      });
    }
  }
);