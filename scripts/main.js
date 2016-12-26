
(function(){
  'use strict';

  var app = {
    isResponded: false,
    userInfo: {},
    spinner: document.querySelector('.loader'),
    eventTemplate: document.querySelector('.eventTemplate'),
    container: document.querySelector('.main')
  }

  /** UI event listeners **/


  /** UI controller methods **/
  app.initEventCard = function(data){
    var eventDate = new Date(data.datetime);
    var yesCount = data.responses.yes.length;
    var noCount = data.responses.no.length;
    var maybeCount = data.responses.maybe.length;

    //initialize a new event card
    var eventCard = app.eventTemplate.cloneNode(true);
    eventCard.classList.remove('eventTemplate');
    eventCard.removeAttribute('hidden');
    //set data
    eventCard.dataset.eventid = data.eventid;
    eventCard.querySelector('.date').textContent = formatDate(eventDate);
    eventCard.querySelector('.venue').textContent = data.venue;
    eventCard.querySelector('.choices .yes .score').dataset.score = yesCount;
    eventCard.querySelector('.choices .no .score').dataset.score = noCount;
    eventCard.querySelector('.choices .maybe .score').dataset.score = maybeCount;

    //attach event listners only if event is in future
    //responses can be made upto midnight of match day
    var deadline = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if(Date.now() > deadline){
      // eventCard.querySelector('.choices .yes .icon').addEventListner('click', function(e) {
      //
      // });
      // eventCard.querySelector('.choices .no .icon').addEventListner('click', function(e) {
      //
      // });
      // eventCard.querySelector('.choices .maybe .icon').addEventListner('click', function(e) {
      //
      // });
    }

    app.container.appendChild(eventCard);
  }


  /** Methods to deal with model **/




  var dumyEventData = {
    eventid: 1234,
    status: "upcoming",
    datetime: "2016-07-22T01:00:00Z",
    venue: "Kingsburry Elimentary School, Redlands",
    responses: {
      yes: [{
        userid: 101,
        name: "ABC",
        email: "abc@gmail.com"
      }, {
        userid: 102,
        name: "ABC",
        email: "abc@gmail.com"
      }, {
        userid: 103,
        name: "ABC",
        email: "abc@gmail.com"
      }],
      no: [{
        userid: 104,
        name: "ABC",
        email: "abc@gmail.com"
      }, {
        userid: 105,
        name: "ABC",
        email: "abc@gmail.com"
      }],
      maybe: [{
        userid: 106,
        name: "ABC",
        email: "abc@gmail.com"
      }]
    }
  }

  app.initEventCard(dumyEventData);

  function formatDate(date){
    if(!date && !(date instanceof Date)) return "";
    var options = {
      "weekday": "short",
      "day": "2-digit",
      "month": "short",
      "hour":"2-digit",
      "minute":"2-digit"
    };
    return date.toLocaleString('en-US', options);
  }
})()
