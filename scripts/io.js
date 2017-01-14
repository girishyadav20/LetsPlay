'use strict'

class IO {
  static initialize(){
    //init database refs
    //TODO - only load future games? TBD
    this.gamesRef = firebase.database().ref().child('games');
    this.gamesRef.off();
    this.gameResponsesRef = firebase.database().ref().child('responses');
    this.gameResponsesRef.off();
    this.usersRef = firebase.database().ref().child('users');
    this.usersRef.off();
    this.notificationRef = firebase.database().ref('notifications');
    this.notificationRef.off();
  };

  static initializeNotifications(){

    this.notificationRef.on('value', snap => {
      if(snap.exists()){
        Util.notifyMe(snap.val());
      }
    })
  };

  static registerUser(userinfo){
    this.getUserInfo(userinfo.uid)
      .then(snap => {
        if(snap.exists()) return;
        let inData = {};
        inData[`/${userinfo.uid}`] = {
          username: userinfo.username,
          userpic: userinfo.userpic
        };
        this.usersRef.update(inData).then(() => console.log('user registered.'));

      });

  };

  static getUserInfo(uid){
    return this.usersRef.child(uid).once('value');
  };

  static loadGames(callback){
    //load games data and attach child add and update listners
    this.gamesRef.on('child_added', snap => {
      console.log(`adding ${snap.key}`);
      callback({
         "gameid": snap.key,
         "metadata": snap.val()
       });
    });

    this.gamesRef.on('child_changed', snap => {
      console.log(`changed ${snap.key}`);
      callback({
         "gameid": snap.key,
         "metadata": snap.val()
       });
    });
  };

  static loadResponses(gameid, callback){
    if(!gameid) throw new Error("Invalid parameters");
    this.gameResponsesRef.child(gameid).on('child_added', snap => {
      this.getUserInfo(snap.key).then(userSnap => {
        callback({
          "userid": userSnap.key,
          "userinfo": userSnap.val(),
          "choice": snap.val()
        });
      });
    });

    this.gameResponsesRef.child(gameid).on('child_changed', snap => {
      this.getUserInfo(snap.key).then(userSnap => {
        callback({
          "userid": userSnap.key,
          "userinfo": userSnap.val(),
          "choice": snap.val()
        });
      });
    });
  };

  static registerResponse(gameid, uid, choice, callback){

    this.gameResponsesRef.child(`/${gameid}/${uid}`).set(choice)
      .then(res => {
        if(callback) callback();
      });
  };

}
