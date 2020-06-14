var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {PythonShell} = require('python-shell')
var app = express();

var expressSession = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    secret: "jn6jk4v6j456456k45jv6j4vc5h23g4cjhv8bk9l"
}));

app.get("/", function (req, res, next) {
    if (typeof req.session.error === "undefined") {

        res.render("index", {error: ""})
    }
    else {
        res.render("index", {error: req.session.error})
    }

})


app.post("/submit", function (req, res, next) {

    let options = {
        mode: 'text',
        pythonPath: path.normalize('/usr/bin/python3.8'),
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: path.normalize('/home/ferdi/lolchat/website'),
        args: [req.body.username, req.body.region]
    };

    PythonShell.run('riotapi.py', options, function (err, results) {
        if (err) return next(err)
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
        let gameTeamId = results[0];
        if (gameTeamId.includes("Error")) {
            req.session.error = gameTeamId;
            res.redirect("/");
            res.end();
            return;
        }
        let options = {
            mode: 'text',
            pythonPath: path.normalize('/usr/bin/python3.8'),
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: path.normalize('/home/ferdi/lolchat/website'),
            args: [gameTeamId]

        };

        PythonShell.run('iceapi.py', options, function (err, results) {
            if (err) return next(err);
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
            if (results[0].includes("Error")) {
                req.session.error = results[0];
                res.redirect("/");
                res.end();
                return;
            }
            else{
                console.log("https://voice.lolvoicechat.com?address=voice.lolvoicechat.com" + results[0] + "&username=" + req.body.username.replace(/\s/g,'') + "&password=" + results[1]);
                res.redirect("https://voice.lolvoicechat.com?address=voice.lolvoicechat.com" + results[0] + "&username=" + req.body.username.replace(/\s/g,'') + "&password=" + results[1]);
               	res.end()
	        
            }
        });

    });

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
