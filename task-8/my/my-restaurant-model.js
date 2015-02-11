var Visitor = Backbone.Model.extend({
    defaults: { lastFoursquareCheckin: "", lastName: "" },

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
    'click .rVisitor input': 'remove_visitor',

    'click input[name="anon_name"]': 'check_new_visitor_anon',

    'keyup input[name="last_name"]': 'check_new_visitor_last',
    'blur input[name="last_name"]': 'check_new_visitor_last',

    'focus input[name="last_name"].rDisabled': 'enable_new_visitor_last',
    'keydown input[name="last_name"].rDisabled': 'enable_new_visitor_last'
  },
    
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function() {
    this.$el.html(this.tmpl(this.model.attributes));
    this.$el.removeClass("rClassopen rClassclosing rClassclosed");
    this.$el.addClass("rClass" + this.model.get('state'));

    var visitors = this.model.get('visitors');
    var self = this;

    visitors.each(function(visModel) { 
            var visRender = visModel.view.render(); 
            self.$el.append(visRender.el);
        });
    return this;
  },

  do_open: function() {
    this.model.openRestaurant();
  },

  do_close: function() {
    this.model.closeRestaurant();
  },

  add_visitor: function(el) {
    var form = el.currentTarget.parentNode;

    var lastNameEl = $(form).children('input[name="last_name"]');
    var anonNameEl = $(form).children('input[name="anon_name"]');

    var lastName = "";
    if (anonNameEl[0].checked) {
        lastName = '[anon]';
    } else {
        lastName = lastNameEl[0].value;
    }
    var visitor = new Visitor({ 'lastName' : lastName });

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
  },

  enable_new_visitor_last: function(el) {
    $(el.currentTarget).removeClass("rDisabled");

    var form = el.currentTarget.parentNode;
    var anonNameEl = $(form).children('input[name="anon_name"]');
    anonNameEl[0].checked = false;
  },

  check_new_visitor_last: function(el) {
    var form = el.currentTarget.parentNode;
    var anonNameEl = $(form).children('input[name="anon_name"]');

    if (el.currentTarget.value == "") {
        anonNameEl[0].checked = true;        
        $(el.currentTarget).addClass("rDisabled");
    } else {
        anonNameEl[0].checked = false;
    }
  },

  check_new_visitor_anon: function(el) {
    var form = el.currentTarget.parentNode;
    var lastNameEl = $(form).children('input[name="last_name"]');

    if (el.currentTarget.checked) {
        lastNameEl[0].value = '';
        lastNameEl.addClass("rDisabled");
    } else {
        lastNameEl.removeClass("rDisabled");
    }
  }
});
