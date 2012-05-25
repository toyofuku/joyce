
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
app.get('/words/:lemma',function(req, res){
  db.all("SELECT w.lemma, w.pos, s.synset, ss.name "+
"FROM word as w, sense as s, synset ss "+
"WHERE w.lemma=? and w.wordid=s.wordid and s.synset=ss.synset", req.params.lemma, function(err, rows){
    res.render('words', { title: 'Words', words: rows})
  });
});
app.get('/senses/:wordid',function(req, res){
  db.all("SELECT ss.name, s.synset, s.rank, s.lexid, s.freq, sd.def "+
"FROM sense as s, synset_def as sd, synset as ss "+
"WHERE s.wordid=? and s.synset=sd.synset and s.synset=ss.synset "+
"order by s.synset", req.params.wordid, function(err, rows){
    res.render('senses', { title: 'Senses', senses: rows})
  });
});
app.get('/sense/:synset',function(req, res){
  db.all("SELECT synset, pos, name, src FROM synset WHERE synset=?", req.params.synset, function(err, rows){
    res.render('senses', { title: 'Senses', synset: rows});
  });
});
app.get('/lemma/:synset',function(req, res){
  db.all("SELECT w.pos, w.lemma "+
"FROM sense as s, word as w "+
"WHERE s.synset=? and s.wordid=w.wordid "+
"ORDER BY w.pos, w.lemma", req.params.synset, function(err, rows){
    res.json(rows, 200);
  });
});
app.get('/synlinks/:synset',function(req, res){
  db.all("SELECT sl.synset2, sl.link, ss.name, ss.pos "+
"FROM synlink as sl, synset ss "+
"WHERE sl.synset1=? and sl.synset2=ss.synset "+
"ORDER BY sl.link, ss.name, ss.pos", req.params.synset, function(err, rows){
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
