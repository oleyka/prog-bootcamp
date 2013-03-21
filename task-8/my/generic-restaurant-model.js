var GenericRestaurantModel = Backbone.Model.extend({

    defaults: {
        state: "open",
        currentOccupancy: 0
    },

    validate: function(attributes) {
        switch(attributes.state) {
        case "open":
		console.log("Running generic validator on an open restaurant");
            if(attributes.currentOccupancy < 0)
                return "Number of visitors must not be negative";
            break;
        case "closed":
            if(attributes.currentOccupancy == 0)
                return "Number of visitors in a closed restaurant must be 0"; // this should be a valid state
            break;
        default:
            return "Expected 'open' or 'close' state";
        }
    },

    visitorCame: function() {
        if(this.get("state") == "open") {
            console.log( "Adding a visitor: " + JSON.stringify(this.set(
                        {currentOccupancy: this.get("currentOccupancy") + 1 },
                        {validate: true}) ) );
            return true;
        } else {
            console.log("Cannot add visitors to a closed restaurant!");
            return false;
        }
    },

    visitorLeft: function() {
        this.set({currentOccupancy: this.get("currentOccupancy") - 1 },
                        {validate: true});
        if(this.get("currentOccupancy") == 0) {
            this.closeRestaurant();
        }
        return true;
    },

    openRestaurant: function() {
        this.set("state", "open");
    },

    closeRestaurant: function() {
		if(this.get("state") == "open") {
            if(this.get("currentOccupancy") == 0)
                this.set("state", "closed");
            else
                throw "Can't close restaurant which still has visitors!";
        }
    }

});

