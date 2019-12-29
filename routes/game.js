var express = require('express');
var router = express.Router();
const Mail=require('../mail');
const multer = require('multer');
const path = require('path');


const {MISC_makeid, MISC_maketoken} = require('../misc');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


/* GET home page. */
router.get('/addgame', ensureAuthenticated, function(req, res, next) {
    res.render('game_add_1', {
        title: 'Portal | Add game asset'
    });
});

/* GET edit page. */
router.get('/editgame', ensureAuthenticated, function(req, res, next) {

    let query = req.query.id;
    console.log(query);

    var sql = "SELECT * FROM gameasset WHERE id = '" + req.query.id + "' AND userid = '"+ req.user.id+"' AND asset_ready=2";
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                console.log(' >>> DEBUG SQL failed', error);
            throw error;
        } else {
            if (debugon)
                console.log(rows[0].asset_name);

            var schemeoptions="";
            if (rows[0].asset_scheme=="0.5") {
                schemeoptions+="<option value='0.5' selected>50%, which means 50% go to You, rest to the players</option>";
            }
            else {
                schemeoptions+="<option value='0.5'>50%, which means 50% go to You, rest to the players</option>";
            }
            if (rows[0].asset_scheme=="0.6") {
                schemeoptions+="<option value='0.6' selected>60%, which means 40% go to You, rest to the players</option>";
            }
            else {
                schemeoptions+="<option value='0.6'>60%, which means 40% go to You, rest to the players</option>";
            }
            if (rows[0].asset_scheme=="0.7") {
                schemeoptions+="<option value='0.7' selected>70%, which means 30% go to You, rest to the players</option>";
            }
            else {
                schemeoptions+="<option value='0.7'>70%, which means 30% go to You, rest to the players</option>";
            }
            if (rows[0].asset_scheme=="0.8") {
                schemeoptions+="<option value='0.8' selected>80%, which means 20% go to You, rest to the players</option>";
            }
            else {
                schemeoptions+="<option value='0.8'>80%, which means 20% go to You, rest to the players</option>";
            }
            if (rows[0].asset_scheme=="0.9") {
                schemeoptions+="<option value='0.9' selected>90%, which means 10% go to You, rest to the players</option>";
            }
            else {
                schemeoptions+="<option value='0.9'>90%, which means 10% go to You, rest to the players</option>";
            }
            if (rows[0].asset_scheme=="1") {
                schemeoptions+="<option value='1' selected>All goes to the players</option>";
            }
            else {
                schemeoptions+="<option value='1'>All goes to the players</option>";
            }

            var periodeoptions="";
            if (rows[0].asset_periode=="24") {
                periodeoptions+="<option value='24' selected>1 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='24'>1 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="48") {
                periodeoptions+="<option value='48' selected>2 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='48'>2 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="72") {
                periodeoptions+="<option value='72' selected>3 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='72'>3 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="96") {
                periodeoptions+="<option value='96' selected>4 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='96'>4 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="148") {
                periodeoptions+="<option value='148' selected>7 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='148'>7 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="296") {
                periodeoptions+="<option value='296' selected>14 day to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='296'>14 day to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="12") {
                periodeoptions+="<option value='12' selected>12 hours to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='12'>12 hours to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="6") {
                periodeoptions+="<option value='6' selected>6 hours to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='6'>6 hours to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="3") {
                periodeoptions+="<option value='3' selected>3 hours to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='3'>3 hours to leader board resolution</option>";
            }
            if (rows[0].asset_periode=="1") {
                periodeoptions+="<option value='1' selected>1 hour to leader board resolution</option>";
            }
            else {
                periodeoptions+="<option value='1'>1 hour to leader board resolution</option>";
            }


            var player1options=

            res.render('game_edit', {
                title: 'Edit game asset',
                gamename: rows[0].asset_name,
                gametoken: rows[0].asset_token,
                gamesecret: rows[0].asset_secret,
                gameathaddr: rows[0].asset_athaddr,
                schemeoption: schemeoptions,
                periodeoption: periodeoptions,
                player1option: buildPlayerOption(rows[0].asset_player1),
                player2option: buildPlayerOption(rows[0].asset_player2),
                player3option: buildPlayerOption(rows[0].asset_player3),
                player4option: buildPlayerOption(rows[0].asset_player4),
                player5option: buildPlayerOption(rows[0].asset_player5),
                gamedesc: rows[0].asset_description,
                gameurl: rows[0].asset_url
            });
        }
    });
});

function buildPlayerOption(value) {
    var text="";

    if (value=="10") {
        text+="<option value='10' selected>100% of the funds go to the player</option>";
    }
    else {
        text+="<option value='10'>100% of the funds go to the player</option>";
    }
    if (value=="9") {
        text+="<option value='9' selected>90% of the funds go to the player</option>";
    }
    else {
        text+="<option value='9'>90% of the funds go to the player</option>";
    }
    if (value=="8") {
        text+="<option value='8' selected>80% of the funds go to the player</option>";
    }
    else {
        text+="<option value='8'>80% of the funds go to the player</option>";
    }
    if (value=="7") {
        text+="<option value='7' selected>70% of the funds go to the player</option>";
    }
    else {
        text+="<option value='7'>70% of the funds go to the player</option>";
    }
    if (value=="6") {
        text+="<option value='6' selected>60% of the funds go to the player</option>";
    }
    else {
        text+="<option value='6'>60% of the funds go to the player</option>";
    }
    if (value=="5") {
        text+="<option value='5' selected>50% of the funds go to the player</option>";
    }
    else {
        text+="<option value='5'>50% of the funds go to the player</option>";
    }
    if (value=="4") {
        text+="<option value='4' selected>40% of the funds go to the player</option>";
    }
    else {
        text+="<option value='4'>40% of the funds go to the player</option>";
    }
    if (value=="3") {
        text+="<option value='3' selected>30% of the funds go to the player</option>";
    }
    else {
        text+="<option value='3'>30% of the funds go to the player</option>";
    }
    if (value=="2") {
        text+="<option value='2' selected>20% of the funds go to the player</option>";
    }
    else {
        text+="<option value='2'>20% of the funds go to the player</option>";
    }
    if (value=="1") {
        text+="<option value='1' selected>10% of the funds go to the player</option>";
    }
    else {
        text+="<option value='1'>10% of the funds go to the player</option>";
    }
    if (value=="0") {
        text+="<option value='0' selected>0% of the funds go to the player</option>";
    }
    else {
        text+="<option value='0'>0% of the funds go to the player</option>";
    }
return(text);
}

router.get('/currentgame', ensureAuthenticated, function(req, res, next) {
    var sql = "SELECT * FROM gameasset WHERE userid="+req.user.id + " AND asset_ready=2";
    if (debugon)
        console.log(sql);
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error);
            throw(error);
        } else {
            if (debugon)
                console.log(rows.length);
            var table="table";

            res.render('game_current', {
                title: 'List over gaming assets',
                game: rows,
                version: version
            });
        }
    });
});

router.get('/removegame', ensureAuthenticated, function(req, res, next) {
    res.render('game_remove', {
        title: 'Portal | Remove gaming assets',
        version: version
    });
});

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/login');
    }
}

const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


router.post('/game_add_1', function(req, res) {
    const gamename = req.body.gamename;
    const gamedesc = req.body.gamedesc;
    const gameurl = req.body.gameurl;

    req.checkBody('gamename', 'Name is required').notEmpty();
    req.checkBody('gamedesc', 'Description is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('game_add_1', {
            errors:errors
        });
    } else {
        // First we do some housekeeping and remove all older asset entries which are not yet op to stage 2
        // and more then an 10 min late
        var vsql = "DELETE FROM gameasset WHERE asset_creation < (NOW() - INTERVAL 10 MINUTE) AND asset_ready < 2";
        if (debugon)
            console.log(vsql);
        pool.query(vsql, function (error, rows, fields) {
            if (error) {
                if (debugon)
                    console.log('>>> Error: ' + error);
            } else {

                // ToDo: Need to do a proper ath address resolution
                var athaddr = "0xABC";
                var gametoken = MISC_maketoken(5);
                var gamesecret = MISC_makeid(50);

                // Stage one
                var vsql = "INSERT INTO gameasset (userid, asset_ready, asset_name, asset_scheme, asset_periode, asset_athaddr, asset_token, asset_secret, asset_description, asset_url, asset_creation) VALUES ('" + req.user.id + "', '0', '" + gamename + "','" + "" + "', '" + "" + "', '" + athaddr + "', '" + gametoken + "', '" + gamesecret + "', '" + gamedesc + "', '" + gameurl + "', '" + pool.mysqlNow() + "')";
                if (debugon)
                    console.log(vsql);
                pool.query(vsql, function (error, rows, fields) {
                    if (error) {
                        if (debugon)
                            console.log('>>> Error: ' + error);
                    } else {
                        res.render('game_add_2', {
                            title: 'Portal | Step2 : Add game asset',
                            version: version,
                            asset_token: gametoken,
                            user: req.user
                        });
                    }
                });
            }
        });
    }
});

router.post('/game_add_2', function(req, res) {

        // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage, fileFilter: imageFilter }).single('profile_pic');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        const asset_token = req.body.asset_token;
        req.checkBody('asset_token', 'Something went wrong').notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            res.render('game_add_1', {
                errors: errors
            });
        } else {
            var vsql = "UPDATE gameasset SET asset_ready=asset_ready=1, asset_pic='" + req.file.path + "' WHERE asset_token='" + asset_token + "'";
            if (debugon)
                console.log(vsql);
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    if (debugon)
                        console.log('>>> Error: ' + error);
                } else {
                    // Display uploaded image for user validation
                    res.render('game_add_3', {
                        title: 'Portal | Step3 : Add game asset',
                        version: version,
                        asset_token: asset_token,
                        user: req.user
                    });

                }
            });
        }
    });
});

router.post('/game_add_3', function(req, res) {
    const asset_token = req.body.asset_token;
    const asset_scheme = req.body.scheme;
    const asset_periode = req.body.periode;
    const asset_player1 = req.body.player1;
    const asset_player2 = req.body.player2;
    const asset_player3 = req.body.player3;
    const asset_player4 = req.body.player4;
    const asset_player5 = req.body.player5;

    req.checkBody('asset_token', 'Something went wrong: No asset token').notEmpty();
    req.checkBody('scheme', 'Something went wrong: No scheme').notEmpty();
    req.checkBody('periode', 'Something went wrong: No periode').notEmpty();
    req.checkBody('player1', 'Something went wrong: No player 1').notEmpty();
    req.checkBody('player2', 'Something went wrong: No player 2').notEmpty();
    req.checkBody('player3', 'Something went wrong: No player 3').notEmpty();
    req.checkBody('player4', 'Something went wrong: No player 4').notEmpty();
    req.checkBody('player5', 'Something went wrong: No player 5').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render('game_add_3', {
            errors: errors
        });
    } else {
        var sum=Number(asset_player1) + Number(asset_player2) + Number(asset_player3) + Number(asset_player4) + Number(asset_player5);
        console.log("Sum: ", sum);
        if (sum == 10) {
            console.log("Update success")
            var vsql = "UPDATE gameasset SET asset_ready=2, asset_scheme='" + asset_scheme + "', asset_periode='" + asset_periode + "', asset_player1='" + asset_player1 + "', asset_player2='" + asset_player2 + "', asset_player3='" + asset_player3 + "', asset_player4='" + asset_player4 + "', asset_player5='" + asset_player5 + "' WHERE asset_token='" + asset_token + "'";
            if (debugon)
                console.log(vsql);
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    if (debugon)
                        console.log('>>> Error: ' + error);
                } else {
                    var sql = "SELECT * FROM gameasset WHERE asset_token = '" + asset_token+"'";
                    pool.query(sql, function (error, rows, fields) {
                        if (error) {
                            if (debugon)
                                console.log(' >>> DEBUG SQL failed', error);
                            throw error;
                        } else {

                            confmail = new Mail();
                            confmail.sendMail(req.user.email, "Atheios Portal: An asset has been created: " + rows[0].asset_name, 'A game asset has been created. Gametoken: ' + asset_token);
                            req.flash('info', 'Asset created');
                            res.redirect('/currentgame');
                        }
                    });
                }
            });
        } else {
            req.flash('danger', 'Check the player distribution, it should be 100%');
            res.render('game_add_3', {
                title: 'Portal | Step3 : Add game asset',
                version: version,
                asset_token: asset_token,
                user: req.user
            });
        }
    }
});







router.post('/game_edit', function(req, res) {
    const asset_token = req.body.gametoken;
    const asset_scheme = req.body.scheme;
    const asset_periode = req.body.periode;
    const asset_player1 = req.body.player1;
    const asset_player2 = req.body.player2;
    const asset_player3 = req.body.player3;
    const asset_player4 = req.body.player4;
    const asset_player5 = req.body.player5;
    const asset_description = req.body.gamedesc;
    const asset_url = req.body.gameurl;
    const asset_name = req.body.gamename;


    if (debugon)
        console.log("Gametoken", req.body);


    req.checkBody('gametoken', 'Something went wrong: No asset token').notEmpty();
    req.checkBody('scheme', 'Something went wrong: No scheme').notEmpty();
    req.checkBody('periode', 'Something went wrong: No periode').notEmpty();
    req.checkBody('player1', 'Something went wrong: No player 1').notEmpty();
    req.checkBody('player2', 'Something went wrong: No player 2').notEmpty();
    req.checkBody('player3', 'Something went wrong: No player 3').notEmpty();
    req.checkBody('player4', 'Something went wrong: No player 4').notEmpty();
    req.checkBody('player5', 'Something went wrong: No player 5').notEmpty();
    req.checkBody('gamedesc', 'Something went wrong: Missing game description').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('/currentgame', {
            errors:errors
        });
    } else {
        if(isNaN(asset_scheme) || isNaN(asset_periode)) {
            if (debugon)
                console.log("Issue with input: " + scheme + "," + periode);

            req.flash('danger', 'Please specify scheme and periode with the predefined values.');
            res.redirect('/currentgame');
        }
        else {
            var vsql = "UPDATE gameasset SET asset_scheme='" + asset_scheme + "', asset_periode='" + asset_periode + "', asset_player1='" + asset_player1 + "', asset_player2='" + asset_player2 + "', asset_player3='" + asset_player3 + "', asset_player4='" + asset_player4 + "', asset_player5='" + asset_player5 + "', asset_description='" + asset_description + "', asset_url='" + asset_url + "' WHERE asset_token='" + asset_token +"'";
            if (debugon)
                console.log(vsql);
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    if (debugon)
                        console.log('>>> Error: ' + error);
                } else {
                    confmail = new Mail();
                    confmail.sendMail(req.user.email, "Atheios GDP: An existing asset has been updated: " + asset_name, 'You have updated an existing game asset.');
                    req.flash('info', 'Asset Updated');
                    res.redirect('/currentgame');
                }
            });
        }
    }
});

module.exports = router;
