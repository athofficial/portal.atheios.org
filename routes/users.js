const express = require('express');
// ...rest of the initial code omitted for simplicity.
const { check, validationResult } = require('express-validator');
const logger = require("../logger");
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {athGetAddress, athGetBalance, athdoWithdraw} = require('../ath');
const {MISC_ensureAuthenticated, MISC_validation, MISC_makeid, MISC_maketoken} = require('../misc');

const Mail=require('../mail');

// Register Form
router.get('/register', function(req, res){
  res.render('register', {
    title:'Portal | Register',
    version: version
  });
});

// Register Form
router.get('/reset', function(req, res){
  res.render('reset', {
    title:'Portal | Reset',
    version: version
  });
});

// Confirmation Proccess
router.get('/activate', function(req, res){
  var option=0;

  var sql = "SELECT * FROM user WHERE rand = '" + req.query.id + "'";
  pool.query(sql, function (error, rows, fields) {
    if (error) {
      if (debugon)
        logger.error('Error: %s', error);
      throw error;
    }
    if (rows.length == 1) {
      if(rows[0].options&8==0) {
        req.flash('danger', 'Account already activated.');
        res.redirect('/register');
      } else {
        var newoption = rows[0].options & 247;
        var athamount = 0;
        if (rows[0].options & 4) {
          athamount = 10;
          athdoWithdraw(NEWUSERFUNDaddress, ATHaddress, athamount, async (error, tx) => {
            if (error) {
              req.flash('danger', 'An error occured: ' + error);
              res.redirect('/manage');
            } else {
              if (debugon) {
                logger.info(">>>> DEBUG NEWUSER fund transfer, 10ATH: %s", tx);
              }
              pool.logging(rows[0].id, athamount.toString() + " ATH are credited as new user bonus to Your gamedev account.");
            }

          });
        } else
          athamount = 0;

        athGetAddress(async (error, athaddress) => {
          if (error) {
            if (debugon)
              logger.error('Error: athGetAddress failed: %s', error);
          } else {
            var vsql = "UPDATE user SET athaddr='" + athaddress + "', athamount=" + athamount + ", options=" + newoption + " WHERE rand='" + req.query.id+"'";
            logger.info("SWL: %s", vsql);
            pool.query(vsql, function (error, rows, fields) {
              if (error) {
                if (debugon)
                  logger.error('Error: ' + error);
              }
              else {
                req.flash('success', 'Account is activated');
                res.redirect('/login');
              }
            });
          }

        });
      }
    }
  });
});

// Login Form
router.get('/login', function(req, res){
  res.render('login', {
    title:'Portal | Account',
    version: version
  });
});

// Reset Form
router.get('/resetpassword', function(req, res){
  res.render('resetpassword', {
    title:'Portal | Password reset procedure',
    version: version
  });
});

// Login Form
router.get('/register', function(req, res){
  var captcha=true;
  res.render('register', {
    title:'Portal | Account',
    version: version,
    captcha: true
  });
});



// Login Form
router.get('/account', MISC_ensureAuthenticated, function(req, res) {
  var darkmode;
  var keyprefs;

  if (req.user) {
    var vsql="SELECT * FROM user WHERE id="+req.user.id;

    pool.query(vsql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s' + error);
      }

      if (rows[0].options&&1)
        darkmode=true;
      else
        darkmode=false;
      if (rows[0].options&&2)
        keyprefs=true;
      else
        keyprefs=false;
      athGetBalance(rows[0].athaddr, async(error,amount) => {
        res.render("account", {
          title: 'Portal | Account',
          version: version,
          amount: amount
        });
      });
    });
  } else {
    req.flash('success', 'You are logged out');
    res.redirect('/login');
  }
});

// logout
router.get('/logout', MISC_ensureAuthenticated, function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/login');
});


// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************
// POST request
// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************
// Register Proccess
router.post('/updatepassword', [
      check('password').notEmpty().withMessage("Password cannot be empty"),
      check('password2').notEmpty().withMessage("Password cannot be empty")
    ],
    function(req, res) {
  const password = req.body.password;
  const password2 = req.body.password2;
  if (req.user) {

    if (!MISC_validation(req)) {
      res.redirect('/account');
    } else {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) {
            logger.error("BCRYPT error: %s",err);
          }
          // write to database
          var vsql = "UPDATE user SET password='" + hash + "' WHERE id=" + parseInt(pool.escape(req.user.id));
          pool.query(vsql, function (error, rows, fields) {
            if (error) {
              if (debugon)
                logger.error('Error: %s', error);
              throw error;
            }
          });
          req.flash('success', 'Account update');
          res.redirect('/account');
        });
      });
    }
  }
  else {
    req.flash('success', 'User logged out');
    res.redirect('/login');

  }
});




// Login Process
router.post('/login', [
    check('username').isLength({min:3,max:20}).withMessage("Check the length of the username."),
    check('password').notEmpty().withMessage("Please specify password")
],function(req, res, next){

  if (!MISC_validation(req)) {
    res.redirect('/login');
  } else {
    var sql = "SELECT * FROM user WHERE username =" + pool.escape(req.body.username);
    logger.info("SQL: %s", sql);
    pool.query(sql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s', error);
        throw error;
      }
      if (rows.length == 1 && (rows[0].options & 8) == 0) {
        passport.authenticate('local', {
          successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true
        })(req, res, next);
      } else {
        req.flash('danger', 'Your account seems either not to be activated or Your username or password are wrong. Check Your email for the activation code.');
        res.redirect('/login');
      }
    });
  }
});


// Reset password Process
router.post('/resetpassword', [
  check('username').isLength({min:3,max:20})
],function(req, res, next){
  if (!MISC_validation(req)) {
    res.redirect('/login');
  } else {
    var sql = "SELECT * FROM user WHERE username = " + pool.escape(req.body.username);
    pool.query(sql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s', error);
        throw error;
      }
      if (rows.length == 1) {
        if ((rows[0].options & 8) == 1) {
          req.flash('danger', 'You try to reset an account which is not yet activated.');
          res.redirect('/login');
        } else {

          // send a mail and move to the password resetting procedure
          var rand = MISC_makeid(50);
          // write to database
          var vsql = "UPDATE user SET reset='" + rand + "', resetcnt=resetcnt+1 WHERE id=" + rows[0].id;
          pool.query(vsql, function (error, rows1, fields) {
            if (error) {
              if (debugon)
                logger.error('Error: %s', error);
            }
            confmail = new Mail();
            confmail.sendMail(rows[0].email, "Atheios game developer account reset", 'You have requested a password reset from ' + config.httphost + '.\nYour reset code is: ' + rand + ' .');
          });


          req.flash('danger', 'We sent an email to Your registered email address. Check Your email for the reset code.');
          res.redirect('/resetpassword');
        }
      } else {
        // send a mail and move to the poaasword resetting procedure
        req.flash('danger', 'We cannot find Your username. Check Your email for the registration mail or contact our support.');
        res.redirect('/login');
      }

    });
  }
});

// Reset password Process
router.post('/resendusername', [
  check('email').isEmail(),
  check('email').notEmpty()
],function(req, res, next) {
  const email = req.body.email;
  if (!MISC_validation(req)) {
    res.redirect('/login');
  } else {

    var sql = "SELECT * FROM user WHERE email = " + pool.escape(email);
    pool.query(sql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s', error);
        throw error;
      }
      if (rows.length == 1) {
        if ((rows[0].options & 8) == 1) {
          req.flash('danger', 'You try to query an account which is not yet activated.');
          res.redirect('/login');
        } else {

          confmail = new Mail();
          confmail.sendMail(rows[0].email, "Atheios game developer account", 'You have requested You username from ' + config.httphost + '.\nYour username is: ' + rows[0].username + ' .');
        }


        req.flash('danger', 'We sent Your login name to Your email address.');
        res.redirect('/login');
      }
    });
  }
});

// Register Proccess
router.post('/resettedpassword', [
    check('password').notEmpty(),
    check('password2').notEmpty()
],function(req, res) {
  const password = req.body.password;
  const password2 = req.body.password2;

  if (password === password2) {
    // Check if resetcode is the one we sent
    var sql = "SELECT * FROM user WHERE reset =" + pool.escape(req.body.resetcode);
    logger.info("SQL: %s", sql);
    pool.query(sql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s', error);
        throw error;
      }
      if (rows.length == 1) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
              logger.error("BCRyPT error: %s", err);
            }
            // write to database
            var vsql = "UPDATE user SET password='" + hash + "' WHERE id=" + rows[0].id;
            logger.info("SQL: %s", vsql);
            pool.query(vsql, function (error, rows, fields) {
              if (error) {
                if (debugon)
                  logger.error('Error: %s', error);
                throw error;
              }
              req.flash('success', 'Account update');
              res.redirect('/account');

            });
          });
        });
      } else {
        req.flash(danger, 'Reset code is not matching');
        res.redirect('/resetpassword');
      }
    });
  } else {
    req.flash(danger, 'Passwords are not alike! Please retype.');
    res.redirect('/resetpassword');
  }
});


// Register Proccess
router.post('/register', [
  check('email').isEmail(),
  check('displayname').isLength({min:1, max:20}),
  check('username').isLength({min:1, max:20})
], function(req, res) {
  const email = req.body.email;
  const displayname = req.body.displayname;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const depositaddr = req.body.depositaddr;
  // Some explaining here
  // The option field in the user database
  // bit 0
  // bit 1
  // bit 2 User has asked for 10 ATH deposit <= This is currently switched off
  // bit 3 User has registered but is not yet confirmed

  if (req.body.newuser==="on")
    var option=4+8;
  else
    var option=8;

  if (!MISC_validation(req)) {
    res.redirect('/register');
  } else {
    // Check if username is already taken
    var sql = "SELECT * FROM user WHERE email = " + pool.escape(email);
    pool.query(sql, function (error, rows, fields) {
      if (error) {
        if (debugon)
          logger.error('Error: %s', error);
        throw error;
      } else {
        if (rows.length == 0) {
          var sql = "SELECT * FROM user WHERE username = " + pool.escape(username);
          pool.query(sql, function (error, rows, fields) {
            if (error) {
              if (debugon)
                logger.error('Error: %s', error);
              throw error;
            } else {
              if (rows.length == 0) {
                bcrypt.genSalt(10, function (err, salt) {
                  bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                      logger.error("Bcrupt error %s:",err);
                    }


                    // write to database
                    var rand = MISC_makeid(50);
                    var vsql = "INSERT INTO user (displayname, username, email, password, depositaddr, athamount, logincnt, lastlogin, register, rand, options, type) VALUES ('" + displayname + "','" + username + "','" + email + "', '" + hash + "', '" + depositaddr + "', 0, 0,'" + pool.mysqlNow() + "','" + pool.mysqlNow() + "', '" + rand + "'," + option + ", 0)";
                    logger.info("SQL: %s" ,vsql);
                    pool.query(vsql, function (error, rows, fields) {
                      if (error) {
                        if (debugon)
                          logger.error('Error: %s', error);
                        throw error;
                      } else {
                        confmail = new Mail();
                        confmail.sendMail(email, "Atheios game developer account activation", 'Welcome to ' + config.httphost + '. Please confirm Your mail by clicking this link: ' + config.httphost + '/activate?id=' + rand + ' .');
                        req.flash('success', 'Account is registered, but needs to be activated. Check Your email address: ' + email);
                        res.redirect('/account');
                      }
                    });
                  });
                });
              } else {
                req.flash('danger', 'The username is already taken.');
                res.redirect('/register');
              }
            }
          });
        } else {
          req.flash('danger', 'Email is already taken.');
          res.redirect('/register');
        }
      }
    });
  }
});

// Register Proccess
router.post('/update', [
  check('displayname').notEmpty(),
  check('displayname').isLength( {min: 1, max:20}).withMessage("Your displayname should be at least 1 max 20 char long"),
  check('email').isEmail()
], function(req, res){
  if (req.user) {
    const displayname = req.body.displayname;
    const email = req.body.email;
    const athaddress = req.body.athaddress;

    if (!MISC_validation(req)) {
      res.redirect('/update');
    } else {
      var vsql = "UPDATE user SET displayname=" + pool.escape(displayname) + ", email=" + pool.escape(email) + " WHERE id=" + parseInt(req.user.id);
      logger.info("SQL: %s", vsql);
      pool.query(vsql, function (error, rows, fields) {
        if (error) {
          if (debugon)
            logger.error('Error: ' + error);
          throw error;
        }
      });
      req.flash('success', 'Account is updated');
      res.redirect('/account');
    }
  }
  else {
    req.flash('success', 'User logged out');
    res.redirect('/login');

  }
});


module.exports = router;
