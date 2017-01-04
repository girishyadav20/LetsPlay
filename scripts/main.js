
(function(){
  'use strict';

  //************************************
  // App Constructor
  //************************************

  const app = {
    spinner: document.querySelector('.loader'),
    gamesContainer: document.querySelector('.main'),
    userPic: document.querySelector('.user-pic'),
    signInBtn: document.querySelector('.sign-in'),
    signOutBtn: document.querySelector('#signOut'),
    title: document.querySelector('.header-title'),
    gamesRef: null,
    gameResponsesRef: null,
    registry: null,
    io: null
  };


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


      IO.loadGames(app.addUpdateGameCard);

    } else { //user is signed out
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
      game.domNode.addEventListener('choiceMade', app.onChoiceMade);
      //add obj to registry
      app.registry.set(gameid, game);
    } else {
      //game = app.registry.get(key);
      game.updateGame(metadata);
    }
  };

  app.onChoiceMade = function(e){
    console.log(e.detail.gameId + " selected " + e.detail.choice);
    //call this from IO
    //app.registerResponse(e.detail.gameId, e.detail.choice);
    let userInfo = {
      "uid": app.auth.currentUser.uid,
      "username": app.auth.currentUser.displayName,
      "userpic": app.auth.currentUser.photoURL
    };
    IO.registerResponse(e.detail.gameId, userInfo, e.detail.choice );
  };

  //************************************
  // Methods to deal with model
  //************************************

  //attach refs
  // app.getDBRefs = function(){
  //   //init database refs
  //   //TODO - only load future games? TBD
  //   app.gamesRef = firebase.database().ref().child('games');
  //   app.gamesRef.off();
  //   app.gameResponsesRef = firebase.database().ref().child('responses');
  //   app.gameResponsesRef.off();
  // };

  //load games data
  // app.loadGamesData = function() {
  //   //load games data and attach child add and update listners
  //   app.gamesRef.on('child_added', snap => {
  //     console.log(`adding ${snap.key}`);
  //     app.addUpdateGameCard(snap.key, snap.val());
  //
  //   });
  //
  //   app.gamesRef.on('child_changed', snap => {
  //     console.log(`changed ${snap.key}`);
  //     app.addUpdateGameCard(snap.key, snap.val());
  //   });
  //
  // };

  // app.loadResponsesData = function(gameid, resType = 'yes'){
  //   app.gameResponsesRef.child("-K41k2sK1onjbypnb3Y").child().equalTo("yes", "choice").on('value', snap => {
  //     console.log(`user ${snap.key} responded ${resType}.`);
  //     //app.addUpdateResponse(gameid, snap.key, snap.val(), resType);
  //   });
  //
  //   app.gameResponsesRef.child(gameid).on('child_removed', snap => {
  //
  //   })
  // };

  // app.registerResponse = function(gameid, choice){
  //   if(!app.auth.currentUser) return; //TODO show message- User need to be signed in.
  //
  //   let user = app.auth.currentUser;
  //   let inData = {};
  //   inData[`/${gameid}/${user.uid}`] = {
  //     username: user.displayName,
  //     userpic: user.photoURL,
  //     choice: choice
  //   };
  //   app.gameResponsesRef.update(inData).then(res => {
  //     console.log("response registered.");
  //   });
  // };


  //************************************
  // App Startup
  //************************************

  window.onload = () =>{
    app.init();
  };


  //************************************
  // Private Utility Functions
  //************************************

  // //Card template
  // function generateCard(key, data){
  //   /* DEV NOTES - way to create node from HTML string so that appendChild can be used.
  //                created a temp div and incerted HTML string. then get the node
  //                by calling firstChild(); */
  //
  //   let temp = document.createElement('div');
  //   temp.innerHTML = `<div class="game-card" id="${key}">
  //             <div class="game-title">${data.title}</div>
  //             <div class="game-date">${formatDate(data.datetime)}</div>
  //             <div class="game-venue">${data.venue}</div>
  //           </div>`;
  //
  //   return temp.firstChild;
  // };

  // //insert these buttons only fo the future games
  // function choicesTemplate(key){
  //   let temp = document.createElement('div');
  //   temp.innerHTML = `<div class="choices" data-gameid="${key}">
  //     <button class="choice choice-yes" data-choice="yes" >Yes</button>
  //     <button class="choice choice-no" data-choice="no" >No</button>
  //     <button class="choice choice-maybe" data-choice="maybe" >May Be</button>
  //   </div>`;
  //   let choicesNode = temp.firstChild;
  //
  //   //event Deligation
  //   choicesNode.addEventListener('click', app.onChoiceSelected);
  //   // choicesNode.querySelector('.choice-yes').addEventListener('click', app.onChoiceSelected);
  //   // choicesNode.querySelector('.choice-no').addEventListener('click', app.onChoiceSelected);
  //   // choicesNode.querySelector('.choice-maybe').addEventListener('click', app.onChoiceSelected);
  //
  //   return choicesNode;
  // };

  // function formatDate(input){
  //   let date = new Date(input);
  //   if(!date && !(date instanceof Date)) return "";
  //   let options = {
  //     "weekday": "short",
  //     "day": "2-digit",
  //     "month": "short",
  //     "hour":"2-digit",
  //     "minute":"2-digit"
  //   };
  //   return date.toLocaleString('en-US', options);
  // };

})()
