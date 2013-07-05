SessionModel = Backbone.Model.extend({
  
  defaults : {
    id : null,
    third_party_id : null,
    name : null,
    email : null,
    status : 0
  },

  isAuthorized : function() {
    return this.has('third_party_id');
  },
  
  logout : function() {
    /* destroy session */
    window.activeSession.set("id", null);
    window.activeSession.set("third_party_id", null);
    FB.logout(function(response) {
     console.log('logout done!');
   });
  },
  
  login : function(opts) {
    _session = this;
  
    opts.before && opts.before();
    //always called after login
    this._onAlways = function() {
      opts.after && opts.after();
    };
    
    this._onError = function(result) {
      console.log('this._onError with result:', result);
    };
    
    this._onSuccess = function(result) {
      console.log('this._onSuccess with result:', result);
      console.log(_session.get('third_party_id'));
    };
    
    this._getUserData = function(callBack) {
      FB.api('/me?fields=third_party_id,email,name', function(response) {
        if(!response || response.error) {
          callBack(response.error);
        } else {
          console.log('"/me" query success where username is ' + response['name'] + '.', response);
          callBack(response);
        }
      });
    };
    
    this._onComplete = function(err, result) {
      console.log('Queue finished. Error occured:', err, ' result:', result);
      err && _session._onError(result);
      !err && _session._onSuccess(result);
      _session._onAlways(result);
    };
    
    this._saveSession = function(user) {
      console.log('_saveSession called, user data:', user);
      /* successful if third_party_id exists */
      if(user['third_party_id']) {
        _session.set({
          id : user['id'],
          third_party_id : user['third_party_id'],
          name : user['name'],
          email : user['email'],
          status : 1
        });
        _session._onComplete(false, "Everything is wonderful.");
      } else {
        _session._onComplete(true, "third_party_id check failed!");
        return false;
      }
    };
    //here we go
    FB.login(function(response) {
      if(response.authResponse) {
        console.log('Fetching authResponse information.... ');
        _session._getUserData(_session._saveSession);
      } else {
        _session._onError('User cancelled login or did not fully authorize.');
      }
    }, {
      scope : 'email,user_likes'
    });
  }
  
});

/* Instantiate session */
window.activeSession = new SessionModel();

fb.models.Rating = Backbone.Model.extend({
   firstname : null,
   lastname : null,
   dept : null,
   endorse: null,
   condemn: null,
   note: null,
   userid: null,
   anon: null,
   urlRoot : "/rating/prof",
   url : function() {
     return this.urlRoot;
   }
});

fb.models.Note = Backbone.Model.extend({
  defaults: {
    review : "",
    userid : "",
    condemn : "",
    endorse: "",
    anon: ""
  }
});

fb.models.NoteCollection = Backbone.Collection.extend({
    model: fb.models.Note,
    urlRoot : "/reviews",
    url : function() {
     return this.urlRoot;
   }
});

fb.models.Prof = Backbone.Model.extend({
   defaults: {
     name: {
      first: "", 
      last: ""},
     dept: "",
     endorse: "",
     condemn: "",
     avg: ""
   }
});

fb.models.ProfCollection = Backbone.Collection.extend({
  model: fb.models.Prof,
  url : function() {
    return "/dept/profs"; 
  } 
});
