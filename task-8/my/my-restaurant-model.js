// To-Do - открывание заново неоткрытого ресторана?

var Visitor = Backbone.Model.extend({
    defaults: { lastFoursquareCheckin: "", n: 0 },

    checkin: function(venue) {
        this.set('lastFoursquareCheckin', venue);
    }
});

// Создаём простую коллекцию посетителей.
var VisitorsList = Backbone.Collection.extend({ model: Visitor });

var RestaurantModel = Backbone.Model.extend({
    defaults: {
        state: "closed",
        currentOccupancy: 0,
        todayCount: 0
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
        var newVisitor = visitor;
        if (!visitor) { newVisitor = new Visitor; }
        if(this.get('state') == "open" && !this.get('visitors').get(newVisitor)) {

            this.set({currentOccupancy: this.get('currentOccupancy') + 1 });
            this.set({todayCount: this.get('todayCount') + 1 });

            newVisitor.set('n', this.get('todayCount'));
            newVisitor.checkin(this.get('restaurantName'));

            this.get('visitors').add(newVisitor);

            return this;
        }
        return false;
    },

    visitorLeft: function(visitor) {
        var visitors = this.get('visitors');
        if(visitors.get(visitor)) {
            this.set({currentOccupancy: this.get('currentOccupancy') - 1 });
            this.get('visitors').remove(visitor);

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
            this.set('todayCount', 0);
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
