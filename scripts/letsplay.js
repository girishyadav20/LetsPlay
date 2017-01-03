
'use strict'

class Game {
  constructor(id) {
    if(!id) throw new Error('id is required.');
    this.gameid = id;
    this.domNode = null;
    this.selectedChoice = "";
    this.isAlive = false;
  };

  addGame(data, container) {
    //if DomNode exists call update()
    if(this.domNode) {this.update(data); return};
    if(!container) throw new Error('container not specified');
    this._checkIsAlive(data.datetime);

    let template = `<div class="game-card mdl-card mdl-shadow--6dp">
              <div class="mdl-card__title mdl-card--border">
                <h3 class="game-title mdl-card__title-text">${data.title}</h3>
              </div>
              <div class=" mdl-card__supporting-text mdl-card--border">
                <div class="game-date">${Util.formatedDateString(data.datetime)}</div>
                <div class="game-time">${Util.formatedTimeString(data.datetime)}</div>
              </div>
              <div class="game-venue mdl-card__supporting-text mdl-card--border">
                <div>${data.venue}</div>
              </div>
            </div>`;
    let temp = document.createElement('div');
    temp.innerHTML = template;
    this.domNode = temp.firstChild;
    this.domNode.appendChild(this._choicesTemplate());
    //insert the responses if game is in future
    if(this.isAlive){
        this.domNode.appendChild(this._responsesTemplate());
    };
    //upgrade elements for MDL
    componentHandler.upgradeElement(this.domNode);
    container.insertBefore(this.domNode, container.firstChild);

    var io = new IO();
    io.loadResponses(this.gameid, this.updateResponse);

  };

  updateGame(newData) {
    if(!this.domNode) throw new Error('dom node not found.');
    this._checkIsAlive(newData.datetime);

    this.domNode.querySelector('.game-title').textContent = newData.title;
    this.domNode.querySelector('.game-date').textContent = Util.formatedDateString(newData.datetime);
    this.domNode.querySelector('.game-time').textContent = Util.formatedTimeString(newData.datetime);
    this.domNode.querySelector('.game-venue').textContent = newData.venue;

    //insert the choice buttons if game is in future
    //let choiceNode = this.domNode.querySelector('.choices');
    //if(this.isAlive){
    //  if(!choiceNode) this.domNode.appendChild(this._choicesTemplate());

    // } else {//remove it
    //   if(choiceNode) choiceNode.remove();
    // }
  };

  updateResponse(data){
    let userid = data.userid, info = data.metadata;
    if(!userid || !data) return;
    //create response tag

  };

  updateScore(choice, add = true){

    let node = this.domNode.querySelector('.score-'+choice);
    if(node){
      add ? ++node.dataset.badge : --node.dataset.badge;
    }

  };

  //insert these buttons only fo the future games
  _choicesTemplate(){
    let temp = document.createElement('div');
    const mdl_Classes = 'mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored ';
    temp.innerHTML = `<div class="choices mdl-card__actions" >
      <button class="choice choice-yes `+ mdl_Classes +`" data-choice="yes" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumb_up</i></button>
      <div class="score score-yes mdl-badge mdl-badge--overlap" data-badge="12"></div>
      <button class="choice choice-no `+ mdl_Classes +`" data-choice="no" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumb_down</i></button>
      <div class="score score-no mdl-badge mdl-badge--overlap" data-badge="2"></div>
      <button class="choice choice-maybe `+ mdl_Classes +`" data-choice="maybe" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumbs_up_down</i></button>
      <div class="score score-maybe mdl-badge mdl-badge--overlap" data-badge="1"></div>
    </div>`;
    let choicesNode = temp.firstChild;

    //event Deligation only add if game is alive
    if(this.isAlive)
      choicesNode.addEventListener('click', this.onChoiceSelected.bind(this));

    componentHandler.upgradeElement(choicesNode);
    return choicesNode;
  };

  _responsesTemplate(){
    let temp = document.createElement('div');
    const mdl_Classes = '';
    temp.innerHTML = `<div class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" >
      <div class="response-tab-bar mdl-tabs__tab-bar">
        <div><a href="#${this.gameid}-yes" class="response-tab-in mdl-tabs__tab " >IN</a></div>
        <div><a href="#${this.gameid}-no" class="response-tab-out mdl-tabs__tab ">OUT</a></div>
        <div><a href="#${this.gameid}-maybe" class="mdl-tabs__tab">MAY BE</a></div>
      </div>
      <div id="${this.gameid}-yes" class="mdl-tabs__panel ">dfgdf</div>
      <div id="${this.gameid}-no" class="mdl-tabs__panel ">sdfg</div>
      <div id="${this.gameid}-maybe" class="mdl-tabs__panel">dsfh</div>
    </div>`;
    let responsesNode = temp.firstChild;
    componentHandler.upgradeElement(responsesNode);
    return responsesNode;
  };

  onChoiceSelected(e){
    if(e.target && (e.target.classList.contains('choice') ||
        e.target.classList.contains('choice-icon'))){
      let gameid = this.gameid;
      let choice = e.target.dataset.choice || e.target.parentNode.dataset.choice;
      if(!gameid || !choice) return; //TODO - show error message

      //bail out if the same choice is clicked a
      if(choice === this.selectedChoice) return;

      this._updateUIOnChoiceChange(choice);

      //raise an event
      var event = new CustomEvent('choiceMade', {'detail': { "gameId": gameid, "choice": choice}});
      this.domNode.dispatchEvent(event);
      //app.registerResponse(gameid, choice);
    }
  };

  _updateUIOnChoiceChange(newChoice){
    let oldChoice = this.selectedChoice;
    if(newChoice === oldChoice) return;
    this.selectedChoice = newChoice;
    //remove selected class
    this.domNode.querySelectorAll('.choices .selected').forEach((node) => {
      node.classList.remove('selected'); //remove selection
      this.updateScore(node.dataset.choice, false); //decrease count
    });
    let newNode = this.domNode.querySelector('.choice-'+newChoice);
    newNode.classList.add('selected'); //add selected class to the new choice
    this.updateScore(newChoice); //increment the score
  };

  _checkIsAlive(date){
    let gameDate = new Date(date);
    (gameDate == "Invalid Date" || gameDate <= Date.now()) ?
      this.isAlive = false :
      this.isAlive = true;
  };


}

class IO {
  constructor(){
    //init database refs
    //TODO - only load future games? TBD
    this.gamesRef = firebase.database().ref().child('games');
    this.gamesRef.off();
    this.gameResponsesRef = firebase.database().ref().child('responses');
    this.gameResponsesRef.off();
  };

  loadGames(callback){
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

  loadResponses(gameid, callback){
    if(!gameid) throw new Error("Invalid parameters");
    //need to load
    this.gameResponsesRef.child(gameid).on('child_added', snap => {
      callback({
        "userid": snap.key,
        "metadata": snap.val()
      });
    });

    this.gameResponsesRef.child(gameid).on('child_changed', snap => {
      callback({
        "userid": snap.key,
        "metadata": snap.val()
      });
    });
  };

  registerResponse(gameid, userinfo, choice, callback){
    let inData = {};
    inData[`/${gameid}/${userinfo.uid}`] = {
      username: userinfo.username,
      userpic: userinfo.userpic,
      choice: choice
    };
    this.gameResponsesRef.update(inData).then(res => {
      console.log("response registered.");
      if(callback) callback("success");
    });
  };

  // updateGame(){
  //   return new Prmise((resolve, reject) => {
  //     this.gamesRef.on('child_changed', snap => {
  //       resolve(snap.key, snap.val());
  //     });
  //   });
  // };

}


class Util {
  static formatedDateString(inDate){
    if(!inDate) return "";
    let date;
    if(!(inDate instanceof Date)){
      date = new Date(inDate);
    } else {
      date = inDate;
    }
    if(!date) return "";
    let optionsDate = {
      "weekday": "short",
      "day": "2-digit",
      "month": "short",
      "year": "numeric"
    };

    return date.toLocaleString('en-US', optionsDate);
  };

  static formatedTimeString(inDate){
    if(!inDate) return "";
    let date;
    if(!(inDate instanceof Date)){
      date = new Date(inDate);
    } else {
      date = inDate;
    }
    if(!date) return "";

    let optionsTime = {
      "hour":"2-digit",
      "minute":"2-digit"
    };
    return date.toLocaleString('en-US', optionsTime);
  }
}
