define(
  [
    'my/myButton',
    'my/myText'
  ],

  function(button, text) {
    button.attachTo('#myButton', {
      'nextPageSelector': '#nextPage',
      'previousPageSelector': '#previousPage'
    });

    text.attachTo('#myText', {
      'nextPageSelector': '#nextPage2',
      'previousPageSelector': '#previousPage2'
    });

  }
);