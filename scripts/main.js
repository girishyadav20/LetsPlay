
(function(){
  'use strict';

  //************************************
  // App Constructor
  //************************************

  let app = {
    spinner: document.querySelector('.loader'),
    gamesContainer: document.querySelector('.main'),
    userPic: document.querySelector('.user-pic'),
    signInBtn: document.querySelector('.sign-in'),
    signOutBtn: document.querySelector('.sign-out'),
    title: document.querySelector('.header-title'),
    gamesRef: null
  };


  //************************************
  // Firebase Initialization
  //************************************

  app.initFirebase = function(){
    //check setup
    if(!window.firebase || !(firebase.app instanceof Function)){
      window.alert('Sorry, unable to load required files.');
      console.error("Unable to load firebase.");
      return;
    }

    const config = {
      apiKey: "AIzaSyA4s5WAv0Zv00VZrQhEXMDImwiWsSpYMBw",
      authDomain: "letsplay-a07f7.firebaseapp.com",
      databaseURL: "https://letsplay-a07f7.firebaseio.com",
      storageBucket: "letsplay-a07f7.appspot.com",
      messagingSenderId: "40702620919"
    };
    firebase.initializeApp(config);

    app.auth = firebase.auth();
    app.auth.onAuthStateChanged(app.onAuthStateChangedListner);
  };


  //************************************
  // Authentication and Sign-In
  //************************************

  //User sign-in status change listener
  app.onAuthStateChangedListner = function(user){
    if(user) { //user is signed in
      console.log(`user ${user.displayName} logged in`);
      //slice user's last name
      let firstName = user.displayName.slice(0, user.displayName.lastIndexOf(' '));

      //update the Header
      app.title.textContent = "Let's Play " + firstName;
      app.userPic.style.backgroundImage = 'url(' + user.photoURL + ')';
      app.userPic.removeAttribute('hidden');
      app.signInBtn.setAttribute('hidden', 'true');

      app.getDBRefs();

      //load games data
      app.loadGamesData();

    } else { //user is signed out
      // app.userName.setAttribute('hidden', 'true');
      console.log(`user ${user.displayName} logged out`);

      //update Header
      app.title.textContent = "Let's Play";
      app.userPic.setAttribute('hidden', 'true');

      app.signInBtn.removeAttribute('hidden');
    }
  };


  //************************************
  // Sign-in controller methods
  //************************************

  //Sign-in handler
  app.signInBtn.addEventListener('click', function(){
    //sign into firebase using google authentication
    let provider = new firebase.auth.GoogleAuthProvider();
    app.auth.signInWithPopup(provider);
  });


  //************************************
  // Main UI controller methods
  //************************************

  app.addUpdateGameCard = function(key, data){
    //Get the card by gameid if its already been added
    let gameCard = app.gamesContainer.querySelector('#' + key);
    if(!gameCard){ // create new Card

      /* DEV NOTES - way to create node from HTML string so that appendChild can be used.
                   created a temp div and incerted HTML string. then get the node
                   by calling firstChild(); */

      var temp = document.createElement('div');
      temp.innerHTML = generateCard(key, data);
      app.gamesContainer.insertBefore(temp.firstChild, app.gamesContainer.firstChild);

    } else { //update the existing card
      gameCard.querySelector('.game-title').textContent = data.title;
      gameCard.querySelector('.game-date').textContent = formatDate(data.datetime);
      gameCard.querySelector('.game-venue').textContent = data.venue;
    };

  };


  //************************************
  // Methods to deal with model
  //************************************

  //attach refs
  app.getDBRefs = function(){
    //init database refs
    //TODO - only load future games? TBD
    app.gamesRef = firebase.database().ref().child('games');
    app.gamesRef.off();
  };

  //load games data
  app.loadGamesData = function() {
    //load games data and attach child add and update listners
    app.gamesRef.on('child_added', snap => {
      console.log(`adding ${snap.key}`);
      app.addUpdateGameCard(snap.key, snap.val());

    });

    app.gamesRef.on('child_changed', snap => {
      console.log(`changed ${snap.key}`);
      app.addUpdateGameCard(snap.key, snap.val());
    });

  };


  //************************************
  // App Startup
  //************************************

  window.onload = () =>{
    app.initFirebase();
  };


  //************************************
  // Private Utility Functions
  //************************************

  //Card template
  function generateCard(key, data){
     return `<div class="game-card" id="${key}">
              <div class="game-title">${data.title}</div>
              <div class="game-date">${formatDate(data.datetime)}</div>
              <div class="game-venue">${data.venue}</div>
            </div>`;
  };

  function formatDate(input){
    let date = new Date(input);
    if(!date && !(date instanceof Date)) return "";
    let options = {
      "weekday": "short",
      "day": "2-digit",
      "month": "short",
      "hour":"2-digit",
      "minute":"2-digit"
    };
    return date.toLocaleString('en-US', options);
  };

})()
