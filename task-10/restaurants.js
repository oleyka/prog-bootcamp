define(
  [
    'my/restaurant_model',
    'my/restaurant_open_button',
    'my/restaurant_close_button'
  ],

  function(Restaurant, Open, Close) {
    function initialize() {
      Restaurant.attachTo('body', { name: 'Whatever',   maxOccupancy: 25 });
      Open.attachTo('input.rOpen', {});
      Close.attachTo('input.rClose', {});
    }

    return initialize;
  }
);

/* function RestaurantNetwork() {
  this.className = 'rClass';
  this.list = [];
}

var rr = new RestaurantNetwork();
rr.list[0] = new Restaurant();
rr.list[0].initialize({ name: 'Bellano',   maxOccupancy: 25 });

rr.list[1] = new Restaurant();
rr.list[1].initialize({ name: 'Chromatic', maxOccupancy: 100 });

function Visitor() {
  this.objectId = '';
  this.lastName = '';
}

function setHeaders(jqXHR) {
    jqXHR.setRequestHeader('X-Parse-Application-Id', 'sUsP9yfDdLAMDqAsFurw6YrVvnhZ3OsbMbePLcQW');
    jqXHR.setRequestHeader('X-Parse-REST-API-Key', 'IXhN9vJahmqqQoqRxmm9aNIVHNiJSU90ypSlko9G');
    jqXHR.setRequestHeader('Content-Type', 'application/json');
    return jqXHR;
} */
