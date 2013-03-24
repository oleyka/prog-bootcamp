var Visitor = Backbone.Model.extend({
    defaults: { lastFoursquareCheckin: "" },

    initialize: function() {
        this.set('cid', this.cid);
    },

    checkin: function(venue) {
        this.set('lastFoursquareCheckin', venue);
    }
});

var VisitorsList = Backbone.Collection.extend({ model: Visitor });

var VisitorView = Backbone.View.extend({
    className: "rVisitor",

    tmpl: _.template($("#visitor-message").html()),

  initialize: function() {
    this.model.view = this;
  },

  render: function() {
    this.$el.html(this.tmpl(this.model.attributes));
    $(".rClass").append(this.$el); // how about 2 restaurants on the same screen
    return this;
  }
});

/////////////////////////////////////////////////////////
var RestaurantModel = Backbone.Model.extend({
    defaults: {
        currentOccupancy: 0,
        name: "",
        state: "closed",
        maxOccupancy: 0
    },
    
    initialize: function() {
        var visitors = new VisitorsList;
        this.set('visitors', visitors);
    },

    validate: function(attributes) {
        switch(attributes.state) {
        case "open":
            if(attributes.currentOccupancy < 0)
                return "Number of visitors must not be negative";
            break;
        case "closing":
            if(attributes.currentOccupancy <= 0)
                return "Number of visitors can only be positive with this state";
            break;

        case "closed":
            if(attributes.currentOccupancy != 0)
                return "Number of visitors in a closed restaurant must be 0";
            break;
        default:
            return "Expected 'open' or 'close' state";
        }
    },

    visitorCame: function(visitor) {
        if(this.get('state') == "open" && !this.get('visitors').get(visitor)) {
            visitor.checkin(this.get('restaurantName'));
            this.get('visitors').add(visitor);
            this.set({currentOccupancy: this.get('currentOccupancy') + 1 });
            return visitor;
        }
        return false;
    },

    visitorLeft: function(visitor) {
        var visitors = this.get('visitors');
        if(visitors.get(visitor)) {
            this.get('visitors').remove(visitor);
            this.set({currentOccupancy: this.get('currentOccupancy') - 1 });

            if(this.get('currentOccupancy') == 0 && this.get('state') == "closing") {
                this.closeRestaurant();
            }
            return this;
        }
        return false;
    },

    openRestaurant: function() {
        var visitors = this.get('visitors');
        if(this.get('state') == "closed") {
            return this.set({'state': "open", 'currentOccupancy': 0}, {validate: true});
        } else {
            console.log("Cannot open unclosed restaurant");
            return false;
        }
    },

    closeRestaurant: function() {
        if(this.get('state') != "closed") {
            if(this.get('currentOccupancy') == 0) {
                this.set({'state': "closed"}, {validate: true});
            } else {
                this.set({'state': "closing"}, {validate: true});
            }
            return this;
        }
        return false;
    }
});

var RestaurantView = Backbone.View.extend({
  className: "rClass",

  // Кэшируем шаблон, данный нам в известном script-блоке.
  tmpl: _.template($("#restaurant-message").html()),

  events: {
    'click .rOpen': 'do_open',
    'click .rClose': 'do_close',
    'click .rNewVisitor': 'add_visitor',
    'click .rVisitor input': 'remove_visitor'
  },
    
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function() {
    this.$el.html(this.tmpl(this.model.attributes));
    var visitors = this.model.get('visitors');
    visitors.each(function(m) { m.view.render(); });
    return this;
  },

  do_open: function() {
    this.model.openRestaurant();
  },

  do_close: function() {
    this.model.closeRestaurant();
  },

  add_visitor: function() {
    var visitor = new Visitor;
    var visView = new VisitorView({model: visitor});
    this.model.visitorCame(visitor);
  },

  remove_visitor: function(el) {
    var visitor = this.model.get('visitors').get(el.currentTarget.id);
    if(visitor) {
        this.model.visitorLeft(visitor);
        return true;
    }
    return false;
  }
});
