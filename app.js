"use strict";


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require("./logger");

const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const Mail=require('./mail');

// Define the globals
global.debugon=true;
global.version="0.1.3";


// Init database
if (config.development) {
    global.baseurl="http://localhost:"+config.PORT;
}
else {
    global.baseurl="https://portal.atheios.org";
};

// Instatiate database
const Database=require('./database');
global.pool=new Database();



// Define express and routes
let indexRouter = require('./routes/index');
let whatsnew = require('./routes/whatsnew');
let users = require('./routes/users');
let gamesRouter = require('./routes/game');
let docRouter = require('./routes/doc');
let statsRouter = require('./routes/stats');
let restRouter = require('./routes/rest');

var app = express();

app.use( (req, res, done) => {
  logger.info("#server.app: URL: %s", req.originalUrl);
  done();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));
// Set Bootstrap Folder
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
// Set Bootstrap Folder
app.use(express.static(path.join(__dirname, 'node_modules/jquery')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));



// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//app.use(morgan('dev'));
app.use(express.json());
app.set('json spaces', 2)
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', whatsnew);
app.use('/', users);
app.use('/', gamesRouter);
app.use('/', docRouter);
app.use('/', statsRouter);
app.use('/', restRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = config.development ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function gameResolution() {
  var i,j;
  var gameresolution;

  // Check all active gameassets
  var sql = "SELECT *,TIMESTAMPDIFF(SECOND, asset_resolution, UTC_TIMESTAMP()) AS secs FROM gameasset WHERE asset_ready=2";
  logger.info("#server.app.gameresolution: SQL: %s", sql);
  pool.query(sql, async (error, rows, fields) => {
    if (error) {
      logger.error("#server.app.gameresolution: Error: %s", error);
      throw(error);
    } else {
      logger.info("#server.app.gameresolution: Games active: %s", rows.length);
      // For all active game assets
      for (i = 0; i < rows.length; i++) {
        // Time to trigger payment
        var timeleft=(parseInt(rows[i].asset_periode) * 3600) -rows[i].secs;
        var tl=timeleft;
        var tldays=parseInt(timeleft/3600/24);
        tl=timeleft-=tldays*3600*24;
        var tlhour=parseInt(timeleft/3600);
        timeleft-=tlhour*3600;
        var tlmin=parseInt(timeleft/60);
        timeleft-=tlmin*60;

        logger.info("#server.app.gameresolution: Secs left: %s %s. %dd%dh%dm", tl, rows[i].asset_name, tldays,tlhour,tlmin);
        if (((parseInt(rows[i].asset_periode) * 3600) < rows[i].secs)) {
          var devpercent = rows[i].asset_scheme;

          logger.info("#server.app.gameresolution: Game resolution: %s", rows[i].asset_name);
          // Find the top gameplays for the game asset which are not yet resolved (gameplay_option=2)
          var sql = "SELECT * FROM gameplay WHERE gameplay_options=2 AND gameasset_id=" + rows[i].id + " ORDER BY gameplay_score DESC";
          logger.info("#server.app.gameresolution: SQL: %s", sql);
          try {
            var rows1 = await pool.query(sql);
            if (rows1.length > 0) {
              logger.info("#server.app.gameresolution: Gameplays available %s", rows1.length);
              // Now we have
              // rows: list of active game asset data
              // rows1: list of played games for this asset
              var payout = 0;
              for (j = 0; j < rows1.length; j++) {
                payout += rows1[j].amount;
              }
              logger.info("#server.app.gameresolution: Payout: %i", payout);
              var gameramount = Math.round(10 * payout * (1.0 - devpercent)) / 10;
              var player1amount = Math.round((payout - gameramount) * rows[i].asset_player1) / 10;
              var player2amount = Math.round((payout - gameramount) * rows[i].asset_player2) / 10;
              var player3amount = Math.round((payout - gameramount) * rows[i].asset_player3) / 10;
              var player4amount = Math.round((payout - gameramount) * rows[i].asset_player4) / 10;
              var player5amount = Math.round((payout - gameramount) * rows[i].asset_player5) / 10;
              logger.info("#server.app.gameresolution: Payout to gamer: %s", gameramount);
              logger.info("#server.app.gameresolution: Payout to player1: %s", player1amount);
              logger.info("#server.app.gameresolution: Payout to player2: %s", player2amount);
              logger.info("#server.app.gameresolution: Payout to player3: %s", player3amount);
              logger.info("#server.app.gameresolution: Payout to player4: %s", player4amount);
              logger.info("#server.app.gameresolution: Payout to player5: %s", player5amount);
              if (true) {
                logger.info("Game resolution");
                logger.info("Gamer award");
                var sql = "UPDATE user SET athamount=athamount+" + gameramount + " WHERE id=" + rows[i].userid;
                logger.info("SQL: %s", sql);
                try {
                  var rows2 = await pool.query(sql);
                } catch (error) {
                  logger.error('Error: %s', error);
                  throw error;
                }
                var sql = "SELECT * FROM user WHERE id=" + rows[i].userid;
                logger.info("SQL: %s", sql);
                try {
                  rows2 = await pool.query(sql);
                } catch (error) {
                  logger.error('Error: %s', error);
                  throw error;
                }
                logger.info("Users with Userid %s", rows2.length);
                if (rows2.length > 0) {
                  var confmail = new Mail();
                  confmail.sendMail(rows2[0].email, "Game resolution with reward for " + rows[i].asset_name, 'You have received ' + gameramount + 'ATH for the game ' + rows[i].asset_name + '. The gamé was played '+ rows1.length +' times\n.');
                }
                var totalamount;
                logger.info("played games: %s", rows1.length);
                switch (rows1.length) {
                  case 1:
                    totalamount = player1amount + player2amount + player3amount + player4amount + player5amount;
                    logger.info("User award %i", rows1.length);
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[0].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }

                    sendUserMail(rows1[0].userid, rows[i].asset_name, totalamount, 1);
                    break;
                  case 2:
                    totalamount = player1amount + (player3amount + player4amount + player5amount) / 2;
                    logger.info("User award %i", rows1.length);
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[0].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[0].userid, rows[i].asset_name, totalamount, 1);
                    totalamount = player2amount + (player3amount + player4amount + player5amount) / 2;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[1].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[1].userid, rows[i].asset_name, totalamount, 2);
                    break;
                  case 3:
                    totalamount = player1amount + (player4amount + player5amount) / 2;
                    logger.info("User award %i", rows1.length);
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[0].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[0].userid, rows[i].asset_name, totalamount, 1);

                    totalamount = player2amount + (player4amount + player5amount) / 2;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[1].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    totalamount = player3amount + (player4amount + player5amount) / 2;
                    sendUserMail(rows1[1].userid, rows[i].asset_name, totalamount, 2);

                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[2].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[2].userid, rows[i].asset_name, totalamount, 3);

                    break;
                  case 4:
                    totalamount = player1amount + (player5amount) / 2;
                    logger.info("User award %i", rows1.length);
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[0].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[0].userid, rows[i].asset_name, totalamount, 1);

                    totalamount = player2amount + (player5amount) / 2;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[1].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[1].userid, rows[i].asset_name, totalamount, 2);

                    totalamount = player3amount + (player5amount) / 2;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[2].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[2].userid, rows[i].asset_name, totalamount, 3);

                    totalamount = player4amount + (player5amount) / 2;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[3].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[3].userid, rows[i].asset_name, totalamount, 4);

                    break;
                  default:
                  case 5:
                    totalamount = player1amount;
                    logger.info("User award %i", rows1.length);
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[0].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[0].userid, rows[i].asset_name, totalamount, 1);

                    totalamount = player2amount;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[1].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[1].userid, rows[i].asset_name, totalamount, 2);

                    totalamount = player3amount;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[2].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[2].userid, rows[i].asset_name, totalamount, 3);

                    totalamount = player4amount;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[3].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[3].userid, rows[i].asset_name, totalamount, 4);

                    totalamount = player5amount;
                    var sql = "UPDATE user SET athamount=athamount+" + totalamount + " WHERE id=" + rows1[4].userid;
                    logger.info("SQL: %s", sql);
                    try {
                      rows2 = await pool.query(sql);
                    } catch (error) {
                      logger.error('Error: %s', error);
                      throw error;
                    }
                    sendUserMail(rows1[4].userid, rows[i].asset_name, totalamount, 5);

                    break;

                }
                // Mark all gameplays for the game as paid, they will not come up anymore
                var sql = "UPDATE gameplay SET gameplay_options=gameplay_options||4 WHERE gameplay_options=2 AND gameasset_id=" + rows[i].id;
                logger.info("SQL: %s", sql);
                try {
                  rows2 = await pool.query(sql);
                } catch (error) {
                  logger.error('Error: %s', error);
                  throw error;
                }
              }
            } else {
              // No games played, send a message to admin of the game to do more!
              var sql = "SELECT * FROM user WHERE id=" + rows[i].userid;
              logger.info("SQL: %s", sql);
              try {
                rows2 = await pool.query(sql);
              } catch (error) {
                logger.error('Error: %s', error);
                throw error;
              }
              logger.info("Users with Userid %s", rows2.length);
              if (rows2.length > 0) {
                var confmail = new Mail();
                confmail.sendMail(rows2[0].email, "Game resolution for " + rows[i].asset_name, 'Unfortunatly no one has played Your game ' + rows[i].asset_name + ' this time.\n.');
              }
            }
            // Now set any new parameters for the next game and make the current time as game initiation time
            var sql = "UPDATE gameasset SET asset_resolution='" + pool.mysqlNow() + "' WHERE id=" + rows[i].id;
            logger.info("SQL: %s", sql);
            try {
              rows2 = await pool.query(sql);
            } catch (error) {
              logger.error('Error: %s', error);
              throw error;
            }

          } catch (error) {
            logger.error('#server.app.gameresolution: Error: %s', error);
            throw error;
          }
        }
      }
    }
  });
}

function sendUserMail(userid, asset_name, amount, position) {
  var sql = "SELECT * FROM user WHERE id="+userid;
  logger.info("SQL: %s", sql);

  pool.query(sql, async (error, rows2, fields) => {
    if (error) {
      if (debugon)
        logger.error('Error: %s', error);
      throw error;
    }
    if (rows2.length>0) {
      var confmail = new Mail();
      confmail.sendMail(rows2[0].email, "You won! Reward for " + asset_name , 'Congratulations! You have been on the ' + position + '. place and qualify for a win. You have received ' + amount + 'ATH for the game ' + asset_name + '.');
    }
  });
}

// Here we check if we shall roll over games
// Initialize long heartbeat every minute
let longIntervalId;
gameResolution();

longIntervalId=setInterval(
    () => gameResolution(),
    60000
);



module.exports = app;