'use strict'

class Util {

  static newGameNotification(gametitle, gamedate){
    var message = 'Scheduled for ' + this.formatedDateString(gamedate) + '. Register your response.'
    var options = {
      body: message,
      icon: 'images/icons/icon/icon-128.png'
    };
    if('Notification' in window && Notification.permission === 'granted') {
      if(message) {
        var notification = new Notification(gametitle, options);
      }
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission(function(permission) {
        if(permission === 'granted' && message) {
          var notification = new Notification(gametitle, options);
        }
      });
    }
  };

  static formatedDateString(inDate){
    if(!inDate) return;
    let date = null;
    if(!(inDate instanceof Date)){
      date = new Date(inDate);
    } else {
      date = inDate;
    };
    if(!date) return;
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
    let date = null;
    if(!(inDate instanceof Date)){
      date = new Date(inDate);
    } else {
      date = inDate;
    };
    if(!date) return;

    let optionsTime = {
      "hour":"2-digit",
      "minute":"2-digit"
    };
    return date.toLocaleString('en-US', optionsTime);
  };

}
