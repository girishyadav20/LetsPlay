
'use strict'

class Game {
  constructor(id) {
    if(!id) throw new Error('id is required.');
    this.gameid = id;
    this.domNode = null;
    this.selectedChoice = "";
    this.isAlive = false;
    this.date = null;
    this.title = "";
    this.notify = true;
  };

  addGame(data, container) {
    //if DomNode exists call update()
    if(this.domNode) {this.updateGame(data); return};
    if(!container) throw new Error('container not specified');
    this._checkIsAlive(data.datetime);
    this.title = data.title;
    let template = `<div class="game-card mdl-card mdl-shadow--6dp">
              <div class="mdl-card__title mdl-card--border">
                <h3 class="game-title mdl-card__title-text">${data.title}</h3>
                <span class="new-game-tag" ` + (this.isAlive ? '' : 'hidden') + `>New</span>
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
    //upgrade elements for MDL
    componentHandler.upgradeElement(this.domNode);
    container.insertBefore(this.domNode, container.firstChild);


  };

  showAll(isShowAll=true){
    if(!this.domNode) return;
    let choicesNode = this.domNode.querySelector('.choices');
    let responsesNode = this.domNode.querySelector('.response-container');

    if(isShowAll){
      if(choicesNode){
        choicesNode.removeAttribute('hidden');
      } else {
        this.domNode.appendChild(this._choicesTemplate());
      };

      if(responsesNode){
        responsesNode.removeAttribute('hidden');
      } else {
        //insert the responses if game is in future
        this.domNode.appendChild(this._responsesTemplate());
        IO.loadResponses(this.gameid, this.updateResponse.bind(this));
      };


    } else {
      choicesNode && choicesNode.setAttribute('hidden', 'true');
      responsesNode && responsesNode.setAttribute('hidden', 'true');
    }
  }

  updateGame(newData) {
    if(!this.domNode) throw new Error('dom node not found.');
    this._checkIsAlive(newData.datetime);

    this.domNode.querySelector('.game-title').textContent = newData.title;
    this.domNode.querySelector('.game-date').textContent = Util.formatedDateString(newData.datetime);
    this.domNode.querySelector('.game-time').textContent = Util.formatedTimeString(newData.datetime);
    this.domNode.querySelector('.game-venue').textContent = newData.venue;
  };

  updateResponse(data){
    let userid = data.userid, info = data.userinfo, choice = data.choice ;
    if(!userid || !info) return;

    //check if user chip already present
    let chip = this.domNode.querySelector('.response-container span[data-uid="'+ userid +'"].response-item');
    if(!chip){
      //create new chip
      let resNode = document.createElement('span');
      resNode.className = "response-item mdl-chip mdl-chip-contact";
      resNode.dataset.uid = userid;
      let avatar = new Image(40,40);
      avatar.src = info.userpic || "/images/profile_placeholder.png";
      avatar.className = "avatar mdl-chip__contact";
      resNode.appendChild(avatar);
      let name = document.createElement('span');
      name.className = "mdl-chip__text user-name";
      name.textContent = info.username;
      resNode.appendChild(name);
      chip = resNode;
    }
    //insert / move chip to target tab
    let targetTabId = this.gameid + '-' + choice;
    let targetTabNode = this.domNode.querySelector('#'+targetTabId);
    if(targetTabNode){
      targetTabNode.appendChild(chip);
      this.updateScore();
    }

    //select the choice for current user
    if(userid === firebase.auth().currentUser.uid){
      this._updateUIOnChoiceChange(choice);

      //show the new game notification
      if(this.isAlive && !this.selectedChoice){
        Util.newGameNotification(this.title, this.date);
      };
    }
  };

  updateScore(){

    let choices = ["yes", "no", "maybe"];
    choices.forEach(choice => {
      //update yes score
      let tabNode = this.domNode.querySelector('#'+ this.gameid + "-" + choice);
      let score = tabNode.hasChildNodes() ? tabNode.childNodes.length : 0;
      let node = this.domNode.querySelector('.score-' + choice);
      node.dataset.badge = score;
    });
  };

  //insert these buttons only fo the future games
  _choicesTemplate(){
    let temp = document.createElement('div');
    const mdl_Classes = 'mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored ';
    temp.innerHTML = `<div class="choices mdl-card__actions" >
      <button class="choice choice-yes `+ mdl_Classes +`" data-choice="yes" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumb_up</i></button>
      <div class="score score-yes mdl-badge mdl-badge--overlap" data-badge="0"></div>
      <button class="choice choice-no `+ mdl_Classes +`" data-choice="no" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumb_down</i></button>
      <div class="score score-no mdl-badge mdl-badge--overlap" data-badge="0"></div>
      <button class="choice choice-maybe `+ mdl_Classes +`" data-choice="maybe" `+ ((this.isAlive) ? '' : 'disabled') +` ><i class="choice-icon material-icons">thumbs_up_down</i></button>
      <div class="score score-maybe mdl-badge mdl-badge--overlap" data-badge="0"></div>
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
    temp.innerHTML = `<div class="response-container mdl-tabs mdl-js-tabs mdl-js-ripple-effect" >
      <div class="response-tab-bar mdl-tabs__tab-bar">
        <div><a href="#${this.gameid}-yes" class="response-tab-in mdl-tabs__tab is-active" >IN</a></div>
        <div><a href="#${this.gameid}-no" class="response-tab-out mdl-tabs__tab ">OUT</a></div>
        <div><a href="#${this.gameid}-maybe" class="mdl-tabs__tab">MAY BE</a></div>
      </div>
      <div id="${this.gameid}-yes" class="tab-panel mdl-tabs__panel is-active" data-placeholder="Be the first to reply."></div>
      <div id="${this.gameid}-no" class="tab-panel mdl-tabs__panel "></div>
      <div id="${this.gameid}-maybe" class="tab-panel mdl-tabs__panel"></div>
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
      //this.updateScore(node.dataset.choice, false); //decrease count
    });
    let newNode = this.domNode.querySelector('.choice-'+newChoice);
    newNode.classList.add('selected'); //add selected class to the new choice
    //this.updateScore(newChoice); //increment the score

    //hide new game tag
    let newTagNode = this.domNode.querySelector('.new-game-tag');
    newTagNode && newTagNode.setAttribute('hidden', 'true');
  };

  _checkIsAlive(date){
    let gameDate = new Date(date);
    (gameDate == "Invalid Date" || gameDate <= Date.now()) ?
      this.isAlive = false : this.isAlive = true;

    this.date = gameDate;
  };

}
