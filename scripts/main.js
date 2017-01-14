
(function(){
  'use strict';

  //************************************
  // App Constructor
  //************************************

  const app = {
    gamesContainer: document.querySelector('.main'),
    userMenuContainer: document.querySelector('.user-menu-wrapper'),
    userPic: document.querySelector('.user-pic'),
    signInBtn: document.querySelector('.sign-in'),
    signOutBtn: document.querySelector('#signOut'),
    title: document.querySelector('.header-title'),
    message: document.querySelector('#snackbar'),
    registry: null
  };

  const MESSAGETEXT = {
    yes: "Alright! See you at the ground. 😃",
    no: "Ohh! We'll miss you ☹️. And you gonna miss the Fun.",
    maybe: "Still thinking 🤔  decide fast."
  }


  //************************************
  // Firebase Initialization
  //************************************

  app.init = function(){
    //instanciate WeakMap registry for ref to added game objects
    app.registry = new Map();
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
    IO.initialize();

    //load games matadata
    IO.loadGames(app.addUpdateGameCard);

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
      let userInfo = {
        uid: user.uid,
        username: user.displayName,
        userpic: user.photoURL
      }
      IO.registerUser(userInfo);
      //slice user's last name
      let firstName = user.displayName.slice(0, user.displayName.lastIndexOf(' '));

      //update the Header
      app.message.classList.remove('mdl-snackbar--active');
      app.title.textContent = "Let's Play " + firstName;
      app.userPic.style.backgroundImage = 'url(' + user.photoURL + ')';
      app.signInBtn.setAttribute('hidden', 'true');
      app.userMenuContainer.removeAttribute('hidden');

      app.registry.forEach(game => game.showAll());

      //check for notification
      // if('Notification' in window){
      //     IO.initializeNotifications();
      // }

      //IO.loadGames(app.addUpdateGameCard);

    } else { //user is signed out
      console.log(`user logged out`);

      //update Header
      app.title.textContent = "Let's Play";
      app.userMenuContainer.setAttribute('hidden', 'true');
      app.signInBtn.removeAttribute('hidden');

      let messageData = {
        message: "Sign in to register your response. And view who all are coming to play.",
        timeout: 5000
      };
      if(app.message.MaterialSnackbar){
        app.message.MaterialSnackbar.showSnackbar(messageData);
      } else {
        let textContainer = app.message.querySelector('.mdl-snackbar__text');
        textContainer.textContent = messageData.message;
        app.message.classList.add('mdl-snackbar--active');
      };

      app.registry.forEach(game => game.showAll(false));
    }
  };


  //************************************
  // Sign-in controller methods
  //************************************

  //Sign-in handler
  app.signInBtn.addEventListener('click', function(){
    //sign into firebase using google authentication
    let provider = new firebase.auth.GoogleAuthProvider();
    app.auth.signInWithRedirect(provider);
  });

  app.signOutBtn.addEventListener('click', function(){
    app.auth.signOut();
  });


  //************************************
  // Main UI controller methods
  //************************************

  app.addUpdateGameCard = function(data){
    let gameid = data.gameid, metadata = data.metadata;
    let game = app.registry.get(gameid);
    if(!game){
      game = new Game(gameid);
      game.addGame(metadata, app.gamesContainer);
      //if user is logged in load complete data
      if(app.auth.currentUser){
        game.showAll();
      }
      game.domNode.addEventListener('choiceMade', app.onChoiceMade);
      //add obj to registry
      app.registry.set(gameid, game);
    } else {
      //game = app.registry.get(key);
      game.updateGame(metadata);
    }
  };

  app.onChoiceMade = function(e){
    //console.log(e.detail.gameId + " selected " + e.detail.choice)
    IO.registerResponse(e.detail.gameId, app.auth.currentUser.uid, e.detail.choice, () => {
      let messageData = {message: MESSAGETEXT[e.detail.choice], timeout: 3500}
      app.message.MaterialSnackbar.showSnackbar(messageData);
    });
  };

  //************************************
  // App Startup
  //************************************

  window.onload = () => {
    //register service worker
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
    //Initialize app
    app.init();
  };

})()
