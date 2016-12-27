
(function(){
  'use strict';

  var app = {
    isResponded: false,
    userInfo: {},
    spinner: document.querySelector('.loader'),
    eventTemplate: document.querySelector('.eventTemplate'),
    container: document.querySelector('.main'),
    userPic: document.querySelector('.user-pic'),
    signInBtn: document.querySelector('.sign-in'),
    signOutBtn: document.querySelector('.sign-out'),
    title: document.querySelector('.header-title'),
    dropdown: document.querySelector('.dropdown'),
    auth: null,
    database: null
  }

  // inititialize Firebase
  app.initFirebase = function(){
    //check setup
    if(!window.firebase || !(firebase.app instanceof Function)){
      window.alert('Sorry, unable to load required files.');
      console.error("Unable to load firebase.");
      return;
    }

    app.auth = firebase.auth();
    app.database = firebase.database();

    app.auth.onAuthStateChanged(app.onAuthStateChangedListner);
  }

  app.onAuthStateChangedListner = function(user){
    if(user) { //user is signed in
      //get user's profile pic and name
      //app.userName.textContent = user.displayName;
      //get user's first name
      var displayName = user.displayName;
      var firstName = displayName.slice(0, displayName.lastIndexOf(' '));
      app.title.textContent = "Let's Play " + firstName;

      app.userPic.style.backgroundImage = 'url(' + user.photoURL + ')';

      //app.userName.removeAttribute('hidden');
      app.userPic.removeAttribute('hidden');

      app.signInBtn.setAttribute('hidden', 'true');

      app.initEventCard(dumyEventData);

    } else { //user is signed out
      // app.userName.setAttribute('hidden', 'true');
      app.title.textContent = "Let's Play";
      app.userPic.setAttribute('hidden', 'true');

      app.signInBtn.removeAttribute('hidden');
    }
  };

  /** UI event listeners **/
  app.signInBtn.addEventListener('click', function(){
    //sign into firebase using google authentication
    var provider = new firebase.auth.GoogleAuthProvider();
    app.auth.signInWithRedirect(provider);
  });

  app.userPic.addEventListener('click', function() {
    app.dropdown.classList.toggle('show');
  });


  app.signOutBtn.addEventListener('click', function() {
    app.auth.signOut();
  });

  /** UI controller methods **/
  app.initEventCard = function(data){
    data.forEach(function(eventData){
      var eventDate = new Date(eventData.datetime);
      var yesCount = eventData.responses.yes.length;
      var noCount = eventData.responses.no.length;
      var maybeCount = eventData.responses.maybe.length;

      //initialize a new event card
      var eventCard = app.eventTemplate.cloneNode(true);
      eventCard.classList.remove('eventTemplate');
      eventCard.removeAttribute('hidden');
      //set data
      eventCard.dataset.eventid = eventData.eventid;
      eventCard.querySelector('.date').textContent = formatDate(eventDate);
      eventCard.querySelector('.venue').textContent = eventData.venue;
      eventCard.querySelector('.choices .yes .score').dataset.score = yesCount;
      eventCard.querySelector('.choices .no .score').dataset.score = noCount;
      eventCard.querySelector('.choices .maybe .score').dataset.score = maybeCount;

      //attach event listners only if event is in future
      //responses can be made upto midnight of match day
      var deadline = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      if(Date.now() > deadline){
        eventCard.querySelector('.choices .yes .icon input[type=radio]').addEventListener('change', function(e){
          console.log("yes+ 1");
        });
        eventCard.querySelector('.choices .no .icon input[type=radio]').addEventListener('change', function(e){
          console.log("no +1");
        });
        eventCard.querySelector('.choices .maybe .icon input[type=radio]').addEventListener('change', function(e){
          console.log("maybe +1");
        });
      }
      app.container.appendChild(eventCard);
    })
  }


  /** Methods to deal with model **/




  var dumyEventData = [{
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
  }, {
    eventid: 4321,
    status: "upcoming",
    datetime: "2016-12-28T15:30:00.000Z",
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
  }]

  //app.initEventCard(dumyEventData);
  app.initFirebase();

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
