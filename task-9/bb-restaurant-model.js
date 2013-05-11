function setHeaders(jqXHR) {
    jqXHR.setRequestHeader('X-Parse-Application-Id', 'sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW');
    jqXHR.setRequestHeader('X-Parse-REST-API-Key', 'IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G');
    jqXHR.setRequestHeader('Content-Type', 'application/json');
    return jqXHR;
}

var Visitor = Backbone.Model.extend({
    defaults: { 
        className: "Visitor", 
        lastName: "", 
        objectId: "",
        syncStatus: "ok"
     },

    initialize: function() {
        this.set('cid', this.cid);
    }
});

var VisitorsList = Backbone.Collection.extend({ 
    model: Visitor,
    getVisitorsIdArray: function() { return this.pluck('objectId'); },
    getByObjectId: function(objId) { return this.findWhere({objectId: objId}); },
    getUnidentVisitor: function() { return this.findWhere({objectId: ""}); },
});

var VisitorView = Backbone.View.extend({
    className: "rVisitor",

    tmpl: _.template($("#visitor-message").html()),

  initialize: function() {
    this.model.view = this;
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
//    console.log(this.model.attributes);
    this.$el.html(this.tmpl(this.model.attributes));
    return this;
  }
});

//////////////////// Restaurant ///////////////////
var RestaurantModel = Backbone.Model.extend({
    defaults: {
        className: 'Restaurant',
        currentOccupancy: 0,
        name: "",
        state: "closed",
        maxOccupancy: 0,
        objectId: "",
        syncStatus: "ok"
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
            this.get('visitors').add(visitor);
            visitor.set('restaurant', this);
            this.set({currentOccupancy: this.get('currentOccupancy') + 1 });
            visitor.set('syncStatus', 'create');
            return this;
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
            visitor.set('syncStatus', 'delete');
            return this;
        }
        return false;
    },

    openRestaurant: function() {
        var visitors = this.get('visitors');
        if(this.get('state') == "closed") {
            this.set({'state': "open", 'currentOccupancy': 0}, {validate: true});
            this.set('syncStatus', 'update');
            return this;
        }
        console.log("Cannot open unclosed restaurant");
        return false;
    },

    closeRestaurant: function() {
        if(this.get('state') != "closed") {
            if(this.get('currentOccupancy') == 0) {
                this.set({'state': "closed"}, {validate: true});
            } else {
                this.set({'state': "closing"}, {validate: true});
            }
            this.set('syncStatus', 'update');
            return this;
        }
        return false;
    }
});

var RestaurantView = Backbone.View.extend({
  className: "rClass",
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

//////////////// Restaurant Network ///////////////
var RestaurantCollection = Backbone.Collection.extend({
    model: RestaurantModel,
    initialize: function() {}
});

var RestaurantCollectionView = Backbone.View.extend({
    className: "rNClass",

    initialize: function() {
        var self = this;
        this.model.each(function(r) {
            self.$el.append(r.view.render().el);
        });
        $("body").append(this.el);
        return this;
    }
});

//////////////// Persister Structure ///////////////
function RestaurantNetwork() {
    var rn = new RestaurantCollection();
    this.readNetwork(rn);
    return rn;
}

RestaurantNetwork.prototype.readNetwork = function(restNet) {
    var self = this;
    var baseUrl = "https://api.parse.com/1/classes/Restaurant";
    var ajaxParams = {
        beforeSend: setHeaders,
        'dataType': 'json',
        'url': baseUrl,
        'type': 'GET',
        success: function(data, status, jqXHR) { self.completeRead(restNet, data); },
        error: function(jqXHR, errStr, errThrown) { self.failRead(errStr + ": " + errThrown); },
        complete: function(jqXHR, status) {}
    };
    $.ajax(ajaxParams);

    this.completeRead = function(restNet, data) {
        var self = this;
        $.each(data.results, function(i, r) {
            var rest = new RestaurantModel(r);
            rest.on('change', function() { self.syncRestaurant(rest) });
//            self.listenTo(rest, 'change:attributes.syncStatus', self.syncRestaurant(rest));

            $.each(r.visitorsArray, function(j, v) {
                var visitor = new Visitor({ 'objectId': v });
                visitor.on('change:syncStatus', function() { self.syncVisitor(visitor) });
//                self.listenTo(visitor, 'change:attributes.syncStatus', self.syncVisitor(visitor));

                visitor.view = new VisitorView({ model: visitor });
                visitor.set('syncStatus', 'read');
                rest.get('visitors').add(visitor);
            });
            rest.view = new RestaurantView({ model: rest });
            restNet.add(rest);
        });
        restNet.view = new RestaurantCollectionView({ model: restNet });
    };
    this.failRead = function(str) { console.log(str); };
};

RestaurantNetwork.prototype.syncRestaurant = function(rest) {
    console.log('Restaurant sync: ' + rest.get('syncStatus'));

    var self = this;
    // большая "сопля": при доюавлении посетителя в ресторан срабатывает 'change' ресторана 
    // c syncStatus = "ok". При проверке выясняется, что есть посетитель, которому не выдан objectId.
    // Посетителю выдаётся objectId и навешивается слежение за syncStatus.
    if (rest.get('syncStatus') == "ok") { 
        var visitor = rest.get('visitors').getUnidentVisitor();
        if (visitor) { 
            self.syncVisitor(visitor); 
            visitor.on('change:syncStatus', function() { self.syncVisitor(visitor) });
        }
        return;
    }

    rest.set('visitorsArray', rest.get('visitors').getVisitorsIdArray());
    var selectAttr = [ 'name', 'maxOccupancy', 'state', 'currentOccupancy', 'visitorsArray' ];
    var baseUrl = "https://api.parse.com/1/classes/";
    var ajaxParams = {
        beforeSend: setHeaders,
        'dataType': 'json',
        'url': baseUrl + rest.get('className'),
        success: function(data, status, jqXHR) { self.completeSync(rest, data); },
        error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
        complete: function(jqXHR, status) {}
    };

    switch (rest.get('syncStatus')) {
    case 'create':
        ajaxParams.type = 'POST';
        ajaxParams.data = JSON.stringify(rest.attributes, selectAttr);
        break;

    case 'update':
        ajaxParams.type = 'PUT';
        ajaxParams.data = JSON.stringify(rest.attributes, selectAttr);
        ajaxParams.url += '/' + rest.get('objectId');
        break;

    case 'delete':
        ajaxParams.type = 'DELETE';
        ajaxParams.url += '/' + rest.get('objectId');
        break;

    case 'read':
        ajaxParams.type = 'GET';
        ajaxParams.url += '/' + rest.get('objectId');
        break;
    }
    $.ajax(ajaxParams);

    this.completeSync = function(rest, data) { 
        console.log("Restaurant " + rest.get('syncStatus') + ": "+ rest.get('objectId') + 
                " ::: " + JSON.stringify(data));

        var method = rest.get('syncStatus');
        rest.set('syncStatus', 'ok');

        switch (method) {
        case 'create': 
            rest.set('objectId', data.objectId); 
            var visitors = rest.get('visitors');
            visitors.each(function(v) {
                if (v.get('objectId') === "") { 
                    v.set('syncStatus', 'create'); 
                } else { v.set('syncStatus', 'update'); }
            });
            break;
        case 'read': 
            rest.set('currentOccupancy', data.currentOccupancy);
            rest.set('maxOccupancy', data.maxOccupancy);
            rest.set('name', data.name);
            rest.set('state', data.state);
            for (var j = 0; j < rest.get('currentOccupancy'); j++) {
                var visitor = new Visitor({ 'objectId': data.visitors[j] });
                visitor.set('syncStatus', 'read');
            }
        case 'update':
        case 'delete':
            break;
        default: break;
        }        
    };
    this.failSync = function(str) { console.log(str); };
};

RestaurantNetwork.prototype.syncVisitor = function(visitor) {
    console.log('Visitor sync: ' + visitor.get('syncStatus'));
    if (visitor.get('syncStatus') == "ok") { return; }

    var self = this;
    var selectAttr = [ 'lastName' ];
    var baseUrl = "https://api.parse.com/1/classes/";
    var ajaxParams = {
        beforeSend: setHeaders,
        'dataType': 'json',
        'url': baseUrl + visitor.get('className'),
        success: function(data, status, jqXHR) { self.completeSync(visitor, data); },
        error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
        complete: function(jqXHR, status) {}
    };

    switch (visitor.get('syncStatus')) {
    case 'create':
        ajaxParams.type = 'POST';
        ajaxParams.data = JSON.stringify(visitor.attributes, selectAttr);
        break;

    case 'update':
        ajaxParams.type = 'PUT';
        ajaxParams.data = JSON.stringify(visitor.attributes, selectAttr);
        ajaxParams.url += '/' + visitor.get('objectId');
        break;

    case 'delete':
        ajaxParams.type = 'DELETE';
        ajaxParams.url += '/' + visitor.get('objectId');
        break;

    case 'read':
        ajaxParams.type = 'GET';
        ajaxParams.url += '/' + visitor.get('objectId');
        break;
    }
    $.ajax(ajaxParams);

    this.completeSync = function(visitor, data) { 
        console.log("Visitor " + visitor.get('syncStatus') + ": "+ visitor.get('objectId') +
            " ::: " + JSON.stringify(data));

        var method = visitor.get('syncStatus');
        visitor.set('syncStatus', 'ok');

        switch (method) {
        case 'create':
            visitor.set('objectId', data.objectId);
            visitor.get('restaurant').set('syncStatus', 'update');
            break; 
        case 'read':
            visitor.set('lastName', data.lastName);
            break;
        case 'delete': 
            visitor.get('restaurant').set('syncStatus', 'update');
            break; 
        case 'update':
        default: break;
        }
    };

    this.failSync = function(str) { console.log(str); };
};