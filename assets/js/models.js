SessionModel = Backbone.Model.extend({
  
  defaults: {
    id: null,
    third_party_id: null,
    name: null,
    email: null,
    status: 0
    }, 
    
  isAuthorized: function () {
    /* true if third_party_id exists */
    return Boolean(this.get("third_party_id"));
    },
    
  logout: function () {
    /* destroy session */
   window.activeSession.set("id", null);
   window.activeSession.set("third_party_id", null);
   FB.logout(function(response) {
     console.log('logout done!');
   });
   },
   
  login: function (opts) {
    console.log('####\n login called.\n####');
    /* run optional passed user func */
    opts.before && opts.before();
    _session = this;
    this._onALWAYS = function () {
      opts.after && opts.after();
    };
    this._onERROR = function () {
      console.log('this._onERROR with result:', result);
    };
    this._onSUCCESS = function (result) {
      console.log('this._onSUCCESS with result:', result);
      console.log(_session.get('third_party_id'));
      _session.trigger('change'); //manual change trigger
    };
    
    this._getuserdata = function (callback) {
      console.log('_getuserdata called;');
      /* Here you can assemble a query */
      FB.api('/me?fields=third_party_id,email,name', function (response) {
      if (!response || response.error) {
        callback(true, response.error);
      } else {
        console.log('"/me" query success where username is ' + response['name'] + '.', response);
        callback(null, response);
      }
      });

    };
    
  this._savesession = function (user, callback) {
    console.log('_savesession called, user data:', user);
    /* if third_party_id exist its totally okay */
   if (user['third_party_id']) {
     _session.set({
       id: user['id'],
       third_party_id: user['third_party_id'],
       name: user['name'],
       email: user['email'],
       status: "1"
     }, {
       silent: true
     });
     callback(null, "Everything is wonderful.");
   } else {
     callback(true, "third_party_id check failed!");
      return false;
   }
  }

  FB.login(function (response) {
    if (response.authResponse) {
    console.log('Fetching authResponse information.... ');
    /* Use async.js to run async functions in a row */
    async.waterfall([
      _session._getuserdata,
      _session._savesession, 
      ], 
      function (err, result) {
        console.log('Queue finished. Error occured:', err, ' result:', result); !! err && _session._onERROR(result); !! !err && _session._onSUCCESS(result);
    _session._onALWAYS(result);
   });

   } else {
   _session._onERROR('User cancelled login or did not fully authorize.');
   }
   }, {
    scope: 'email,user_likes'
   });
 }

});
/* Instantiate session */
window.activeSession = new SessionModel();
console.log('authorized after create (should be false):', window.activeSession.isAuthorized());
      
fb.models.Person = Backbone.Model.extend({
    defaults: {
        "id":  "",
        "name":     "",
        "first_name":    "",
        "last_name":    "",
        "gender":    "",
        "username":    "",
        "link":    "",
        "locale":    "",
        "timezone":    ""
    }
});

fb.models.Rating = Backbone.Model.extend({
   firstname : null,
   lastname : null,
   dept : null,
   endorse: null,
   condemn: null,
   note: null,
   userid: null,
   urlRoot : "/prof",
   url : function() {
     return this.urlRoot;
   }
});

fb.models.PersonCollection = Backbone.Collection.extend({

    model: fb.models.Person

});

fb.models.Note = Backbone.Model.extend({
  defaults: {
    "profid" : "",
    "review" : "",
    "userid" : "",
    "status" : "",
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
    /*defaults: {
        "id":  "",
        "firstname":    "",
        "lastname":    "",
        "department": "",
        "endorse": "",
        "condemn": ""
    }*/
   defaults: {
     "name": "",
   }
});

fb.models.ProfCollection = Backbone.Collection.extend({
  model: fb.models.Prof,
  url : function() {
    return "/profs"; 
  } 
});

var a = new fb.models.Prof({"name":"Alan Test"}),
    b = new fb.models.Prof({"name":"Bill Test"}),
    c = new fb.models.Prof({"name":"Jee Test"}),
    d = new fb.models.Prof({"name":"Kai Test"}),
    e = new fb.models.Prof({"name":"Bruce Test"}),
    f = new fb.models.Prof({"name":"Mah Test"});

window.profCollection = new fb.models.ProfCollection();
window.profCollection.add(a);
window.profCollection.add(b);
window.profCollection.add(c);
window.profCollection.add(d);
window.profCollection.add(e);
window.profCollection.add(f);

var text = "Cow tri-tip shank pork belly chuck ball tip. ;Hamburger turducken " +
"rump ground round beef ribs tail bresaola beef spare ribs frankfurter salami shoulder "+ 
"drumstick. Chuck capicola sausage meatball tongue pig meatloaf pork prosciutto doner tenderloin."+
"Brisket tri-tip boudin, shank venison filet mignon biltong";
var text2 = text + text;
var g = new fb.models.Note({"profid": 1, "review": text, "userid": 2, "status": 1}),
    h = new fb.models.Note({"profid": 1, "review": text, "userid": 2, "status": 1}),
    i = new fb.models.Note({"profid": 1, "review": text2, "userid": 2, "status": 1}),
    j = new fb.models.Note({"profid": 1, "review": text, "userid": 2, "status": 1}),
    k = new fb.models.Note({"profid": 1, "review": text2, "userid": 2, "status": 1}),
    l = new fb.models.Note({"profid": 1, "review": text2, "userid": 2, "status": 1});
    
window.noteCollection = new fb.models.NoteCollection();
window.noteCollection.add(g);
window.noteCollection.add(h);
window.noteCollection.add(i);
window.noteCollection.add(j);
window.noteCollection.add(k);
window.noteCollection.add(l);

console.log(window.profCollection);
console.log(window.noteCollection);
