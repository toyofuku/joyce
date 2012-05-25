
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , sqlite3 = require('sqlite3').verbose();

var app = module.exports = express.createServer();
var db = new sqlite3.Database('/Users/toyofuku/python/nltk/wnjpn.db');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/linkdef',function(req, res){
  db.all("SELECT * FROM link_def ORDER BY link", function(err, rows){
    res.render('linkdef', { title: 'joice - linkdef', linkdef: rows})
  });
});
app.get('/words/:lemma',function(req, res){
  var lemma = req.params.lemma;
  if(lemma){
    db.all("SELECT DISTINCT w.lemma, w.pos, s.synset, ss.name "+
"FROM word as w, sense as s, synset ss "+
"WHERE w.lemma=? and w.wordid=s.wordid and s.synset=ss.synset "+
"ORDER BY w.pos, ss.name", lemma.toLowerCase(), function(err, rows){
      if(rows.length!=0){
        res.render('words', { title: 'joice - words', words: rows})
      }
    });
  }
});
app.get('/sense/:synset',function(req, res){
  db.all("SELECT DISTINCT synset, pos, name, src FROM synset WHERE synset=?", req.params.synset, function(err, rows){
    res.render('sense', { title: 'joice - sense', synset: rows});
  });
});
app.get('/synlinks/:synset',function(req, res){
  db.all("SELECT DISTINCT sl.synset2, sl.link, ld.def, ss.name, ss.pos "+
"FROM synlink as sl, synset as ss, sense as s, link_def as ld "+
"WHERE sl.synset1=? and sl.synset2=ss.synset and sl.synset2=s.synset and sl.link=ld.link "+
"ORDER BY sl.link, s.freq desc, ss.name, ss.pos", req.params.synset, function(err, rows){
    var result = {};
    for(var i in rows){
      var link = rows[i].def;
      if(!result[link]){ result[link] = []; }
      result[link].push(rows[i]);
    }
    res.json(result, 200);
  });
});
app.get('/lemma/:synset',function(req, res){
  db.all("SELECT DISTINCT w.pos, w.lemma "+
"FROM sense as s, word as w "+
"WHERE s.synset=? and s.wordid=w.wordid "+
"ORDER BY s.freq desc, s.lexid, w.pos, w.lemma", req.params.synset, function(err, rows){
    res.json(rows, 200);
  });
});
app.get('/def/:synset',function(req, res){
  db.all("SELECT DISTINCT sd.def "+
"FROM synset_def as sd "+
"WHERE sd.synset=? ", req.params.synset, function(err, rows){
    res.json(rows,200);
  });
});
app.get('/examples/:synset',function(req, res){
  db.all("SELECT DISTINCT sx.def "+
"FROM synset_ex as sx "+
"WHERE sx.synset=? ", req.params.synset, function(err, rows){
    res.json(rows,200);
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
