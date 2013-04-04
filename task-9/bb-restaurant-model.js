var Visitor = Backbone.Model.extend({
    defaults: { className: "Visitor", lastName: "", objectId: "" },

    initialize: function() {
        this.set('cid', this.cid);
    },

    sync: function(method) { 
        var self = this;
        var selectAttr = [ 'lastName', 'cid' ];
        var baseUrl = "https://api.parse.com/1/classes/";

        var ajaxParams = {
            'url': baseUrl + this.get('className'),
            'contentType': 'application/json',
            'dataType': 'json',
            'headers': { 'X-Parse-Application-Id': "sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW", 
                         'X-Parse-REST-API-Key': "IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G" },

            success: function(data, status, jqXHR) { self.completeSync(data, method); },
            error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
            complete: function(jqXHR, status) {}
        };

        switch (method) {
        case 'create':
            ajaxParams.type = 'POST';
            ajaxParams.data = JSON.stringify(this.attributes, selectAttr);
            break;

        case 'update':
            ajaxParams.type = 'PUT';
            ajaxParams.data = JSON.stringify(this.attributes, selectAttr);
            ajaxParams.url += '/' + this.get('objectId');
            break;

        case 'delete':
            ajaxParams.type = 'DELETE';
            ajaxParams.url += '/' + this.get('objectId');
            break;

        case 'read':
            ajaxParams.type = 'GET';
            ajaxParams.url += '/' + this.get('objectId');
            break;
        }
        console.log('Running ' + ajaxParams.type + ": " + ajaxParams.data);
        $.ajax(ajaxParams);
    },

    completeSync: function(data, method) { 
        console.log("Completed " + method);

        var baseUrl = "https://api.parse.com/1/classes/";
        var self = this;

        switch (method) {
        case 'create':
            this.set('objectId', data.objectId); 

            var rest = this.get('restaurant');
            var ajaxParams = {
                'url': baseUrl + rest.get('className') + '/' + rest.get('objectId'),
                'contentType': 'application/json',
                'dataType': 'json',
                'headers': { 'X-Parse-Application-Id': "sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW", 
                             'X-Parse-REST-API-Key': "IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G" },
                'type': "PUT", 
                data: JSON.stringify({'__op': "AddUnique", 'visitors': [ rest.get('objectId') ] }),
                success: function(data, status, jqXHR) { },
                error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
                complete: function(jqXHR, status) {}
            };
            console.log('Running ' + ajaxParams.type + ": " + ajaxParams.data);
            $.ajax(ajaxParams);
            break; 
        case 'read':
            this.set('cid', data.cid);
            this.set('lastName', data.lastName);
            break;
        case 'update': break;
        case 'delete': 
            var rest = this.get('restaurant');
            var ajaxParams = {
                'url': baseUrl + rest.get('className') + '/' + rest.get('objectId'),
                'contentType': 'application/json',
                'dataType': 'json',
                'headers': { 'X-Parse-Application-Id': "sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW", 
                             'X-Parse-REST-API-Key': "IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G" },
                'type': "PUT", 
                data: JSON.stringify({'__op': "Remove", 'visitors': [ rest.get('objectId') ] }),
                success: function(data, status, jqXHR) { },
                error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
                complete: function(jqXHR, status) {}
            };
            console.log('Running ' + ajaxParams.type + ": " + ajaxParams.data);
            $.ajax(ajaxParams);
            break;
        default: break;
        }
    },
    failSync: function(str) { console.log(str); }
});

var VisitorsList = Backbone.Collection.extend({ 
    model: Visitor,
    getByObjectId: function(objectId) {
        this.each(function(v){ 
            if (v.get('objectId') === objectId) { return v; }
        });
        return false;
    }
});

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
        className: 'Restaurant',
        currentOccupancy: 0,
        name: "",
        state: "closed",
        maxOccupancy: 0,
        objectId: "",
        syncInProgress: 0
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

    sync: function(method, visitor) { 
        var self = this;
        var selectAttr = [ 'currentOccupancy', 'name', 'state', 'maxOccupancy' ];
        var baseUrl = "https://api.parse.com/1/classes/";
        var ajaxParams = {
            'url': baseUrl + this.get('className'),
            'contentType': 'application/json',
            'dataType': 'json',
            'headers': { 'X-Parse-Application-Id': "sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW", 
                         'X-Parse-REST-API-Key': "IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G" },
            success: function(data, status, jqXHR) { self.completeSync(data, method, visitor); },
            error: function(jqXHR, errStr, errThrown) { self.failSync(errStr + ": " + errThrown); },
            complete: function(jqXHR, status) {}
        };

        switch (method) {
        case 'create':
            ajaxParams.type = 'POST';
            ajaxParams.data = JSON.stringify(this.attributes, selectAttr);
            break;

        case 'update':
        case 'addVisitor':
        case 'removeVisitor':
            ajaxParams.type = 'PUT';
            ajaxParams.data = JSON.stringify(this.attributes, selectAttr);
            ajaxParams.url += '/' + this.get('objectId');
            break;

        case 'delete':
            ajaxParams.type = 'DELETE';
            ajaxParams.url += '/' + this.get('objectId');
            break;

        case 'read':
            ajaxParams.type = 'GET';
            ajaxParams.url += '/' + this.get('objectId');
            break;
        }
        console.log('Running ' + ajaxParams.type + ": " + ajaxParams.data);
        $.ajax(ajaxParams);
    },

    completeSync: function(data, method, visitor) { 
        console.log("Completed " + method);

        switch (method) {
        case 'create': 
            this.set('objectId', data.objectId); 
            var visitors = this.get('visitors');
            visitors.each(function(v) {
                if (v.get('objectId') === "") { 
                    v.sync('create'); 
                // on completion of sync, visitor will add itself to visitors[] on Parse
                } else { v.sync('update'); }
            });
            break;
        case 'update': break;
        case 'addVisitor': 
            visitor.sync('create'); 
            break;
        case 'removeVisitor': 
            if (visitor.get('objectId') !== "") { visitor.sync('delete'); }
            break;
        case 'delete': 
        // this doesn't delete existing visitors from Parse!
            break;
        case 'read': 
            this.set('currentOccupancy', data.currentOccupancy);
            this.set('maxOccupancy', data.maxOccupancy);
            this.set('name', data.name);
            this.set('state', data.state);
            for (var j = 0; j < this.get('currentOccupancy'); j++) {
                var visitor = new Visitor({ 'objectId': data.visitors[j] });
                visitor.sync('read');
            }
        default: break;
        }        
    },
    failSync: function(str) { console.log(str); },

    visitorCame: function(visitor) {
        if(this.get('state') == "open" && !this.get('visitors').get(visitor)) {
            this.get('visitors').add(visitor);
            visitor.set('restaurant', this);
            this.set({currentOccupancy: this.get('currentOccupancy') + 1 });
            this.sync('addVisitor', visitor);
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
            this.sync('removeVisitor', visitor);
            return this;
        }
        return false;
    },

    openRestaurant: function() {
        var visitors = this.get('visitors');
        if(this.get('state') == "closed") {
            this.set({'state': "open", 'currentOccupancy': 0}, {validate: true});
            this.sync('update');
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
            this.sync('update');
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
