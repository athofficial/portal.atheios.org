var express = require('express');
var logger = require('../logger');
// ...rest of the initial code omitted for simplicity.
const { check, validationResult } = require('express-validator');

var router = express.Router();
const Mail=require('../mail');
const multer = require('multer');
const path = require('path');
var mv = require('mv');
const {athGetAddress, athGetBalance, athdoWithdraw} = require('../ath');
const Email = require('email-templates');



const {MISC_ensureAuthenticated, MISC_validation, MISC_makeid, MISC_maketoken} = require('../misc');

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
router.get('/addgame', MISC_ensureAuthenticated, function(req, res, next) {
    res.render('game_add_1', {
        title: 'Portal | Add game asset',
        version: version,
        user: req.user
    });
});

/* GET delete page. */
router.get('/deletegame', MISC_ensureAuthenticated, function(req, res, next) {
    let gameid = parseInt(req.query.id);
    let userid = parseInt(req.user.id);

    var sql = "SELECT * FROM gameasset WHERE id = " + pool.escape(gameid) + " AND userid = " + pool.escape(userid) + " AND asset_ready=2";
    logger.info("SQL: %s",sql);
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                logger.error('SQL failed %s', error);
            throw error;
        } else {
            if (rows.length==1) {
                res.render('game_remove', {
                    title: 'Portal | Remove existing game asset',
                    version: version,
                    user: req.user,
                    gamename: rows[0].asset_name,
                    gametoken: rows[0].asset_token,
                    gamesecret: rows[0].asset_secret
                });
            } else {
                req.flash('info', 'Asset deletion not possible');
                res.redirect('/currentgame');
            }
        }
    });
});


/* GET edit page. */
router.get('/editgame', MISC_ensureAuthenticated, function(req, res, next) {

    let query = req.query.id;

    var sql = "SELECT * FROM gameasset WHERE id = '" + req.query.id + "' AND userid = '"+ req.user.id+"' AND asset_ready=2";
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                logger.error('SQL failed %s', error);
            throw error;
        } else {
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
            wageoptions="";
            if (rows[0].asset_wage==1) {
                wageoptions+="<option value='1' selected>1 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='1'>1 ATH waging</option>";
            }
            if (rows[0].asset_wage==5) {
                wageoptions+="<option value='5' selected>5 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='5'>5 ATH waging</option>";
            }
            if (rows[0].asset_wage==10) {
                wageoptions+="<option value='10' selected>10 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='10'>10 ATH waging</option>";
            }
            if (rows[0].asset_wage==25) {
                wageoptions+="<option value='25' selected>25 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='25'>25 ATH waging</option>";
            }
            if (rows[0].asset_wage==50) {
                wageoptions+="<option value='50' selected>50 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='50'>50 ATH waging</option>";
            }
            if (rows[0].asset_wage==100) {
                wageoptions+="<option value='100' selected>100 ATH waging</option>";
            }
            else {
                wageoptions+="<option value='100'>100 ATH waging</option>";
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
                gameurl: rows[0].asset_url,
                wageoptions: wageoptions,
            });
        }
    });
});

function buildPlayerOption(value) {
    var text="";

    if (value=="100") {
        text+="<option value='100' selected>100% of the funds go to the player</option>";
    }
    else {
        text+="<option value='100'>100% of the funds go to the player</option>";
    }
    if (value=="90") {
        text+="<option value='90' selected>90% of the funds go to the player</option>";
    }
    else {
        text+="<option value='90'>90% of the funds go to the player</option>";
    }
    if (value=="80") {
        text+="<option value='80' selected>80% of the funds go to the player</option>";
    }
    else {
        text+="<option value='80'>80% of the funds go to the player</option>";
    }
    if (value=="70") {
        text+="<option value='70' selected>70% of the funds go to the player</option>";
    }
    else {
        text+="<option value='70'>70% of the funds go to the player</option>";
    }
    if (value=="60") {
        text+="<option value='60' selected>60% of the funds go to the player</option>";
    }
    else {
        text+="<option value='60'>60% of the funds go to the player</option>";
    }
    if (value=="50") {
        text+="<option value='50' selected>50% of the funds go to the player</option>";
    }
    else {
        text+="<option value='50'>50% of the funds go to the player</option>";
    }
    if (value=="40") {
        text+="<option value='40' selected>40% of the funds go to the player</option>";
    }
    else {
        text+="<option value='40'>40% of the funds go to the player</option>";
    }
    if (value=="35") {
        text+="<option value='35' selected>35% of the funds go to the player</option>";
    }
    else {
        text+="<option value='35'>35% of the funds go to the player</option>";
    }
    if (value=="30") {
        text+="<option value='30' selected>30% of the funds go to the player</option>";
    }
    else {
        text+="<option value='30'>30% of the funds go to the player</option>";
    }
    if (value=="25") {
        text+="<option value='25' selected>25% of the funds go to the player</option>";
    }
    else {
        text+="<option value='25'>25% of the funds go to the player</option>";
    }
    if (value=="20") {
        text+="<option value='20' selected>20% of the funds go to the player</option>";
    }
    else {
        text+="<option value='20'>20% of the funds go to the player</option>";
    }
    if (value=="15") {
        text+="<option value='15' selected>15% of the funds go to the player</option>";
    }
    else {
        text+="<option value='15'>15% of the funds go to the player</option>";
    }
    if (value=="10") {
        text+="<option value='10' selected>10% of the funds go to the player</option>";
    }
    else {
        text+="<option value='10'>10% of the funds go to the player</option>";
    }
    if (value=="5") {
        text+="<option value='5' selected>5% of the funds go to the player</option>";
    }
    else {
        text+="<option value='5'>5% of the funds go to the player</option>";
    }
    if (value=="0") {
        text+="<option value='0' selected>0% of the funds go to the player</option>";
    }
    else {
        text+="<option value='0'>0% of the funds go to the player</option>";
    }
return(text);
}

router.get('/currentgame', MISC_ensureAuthenticated, function(req, res, next) {
    var sql = "SELECT * FROM gameasset WHERE userid="+pool.escape(req.user.id) + " AND asset_ready=2";
    if (debugon)
        logger.info("SQL: %s",sql);
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            logger.error("Error: %s", error);
            throw(error);
        } else {
            var table="table";

            res.render('game_current', {
                title: 'List over gaming assets',
                game: rows,
                version: version
            });
        }
    });
});

router.get('/highlightgame', MISC_ensureAuthenticated, function(req, res, next) {
    let gameid = parseInt(req.query.id);
    let userid = parseInt(req.user.id);

    var sql = "SELECT * FROM gameasset WHERE id = " + pool.escape(gameid) + " AND userid = " + pool.escape(userid) + " AND asset_ready=2";
    logger.info("SQL: %s",sql);
    pool.query(sql, function (error, rows, fields) {
        if (error) {
            logger.error('SQL failed %s', error);
            throw error;
        } else {
            if (rows.length==1) {
                res.render('game_highlight', {
                    title: 'Portal | Highlight existing game asset',
                    version: version,
                    user: req.user,
                    gamename: rows[0].asset_name,
                    gameperiod: rows[0].asset_period,
                    gametoken: rows[0].asset_token,
                    gamesecret: rows[0].asset_secret
                });
            } else {
                req.flash('info', 'Action on asset not possible');
                res.redirect('/currentgame');
            }
        }
    });
});


router.get('/publishgame', MISC_ensureAuthenticated, function(req, res, next) {
    let query = req.query.id;

    var vsql = "UPDATE gameasset SET asset_options=asset_options ^ b'00000001' WHERE id=" + pool.escape(query);
    if (debugon)
        logger.info("SQL: %s",vsql);
    pool.query(vsql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                logger.error('Error: %s' + error);
            throw error;
        } else {
            // Display uploaded image for user validation
            res.redirect('/currentgame');
        }
    });
});

router.get('/statsgame', MISC_ensureAuthenticated, function(req, res, next) {
    let gameid = parseInt(req.query.id);
    let userid = parseInt(req.user.id);


    var i;
    var month;
    var arr=[];
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var vsql = "SELECT * FROM gameasset WHERE id = " + pool.escape(gameid) + " AND userid = " + pool.escape(userid) + " AND asset_ready=2";
    pool.query(vsql, function (error, rows2, fields) {
        if (error) {
            logger.error('#routes.games.get.statsgame: Error: %s', error);
            req.flash('danger', 'An error occured: ' + error);
            res.redirect('/');
        } else {
            if (rows2.length == 1) {
                // First we check by how many users the game is played
                var vsql = "SELECT *, DATE_FORMAT(gameplay_start_date, \"%m\") AS startdate FROM gameplay WHERE gameasset_id = " + rows2[0].id + " ORDER BY gameplay_start_date";
                pool.query(vsql, function (error, rows, fields) {
                    if (error) {
                        logger.error('#routes.games.get.statsgame: Error: %s', error);
                        req.flash('danger', 'An error occured: ' + error);
                        res.redirect('/');
                    } else {

                        for (i = 0; i < 12; i++) {
                            arr[i] = 0;
                        }
                        d = new Date();
                        month = d.getMonth();
                        for (i = 0; i < rows.length; i++) {
                            console.log("%s: %s", i, rows[i].startdate);
                            arr[parseInt(rows[i].startdate) - 1] = arr[parseInt(rows[i].startdate) - 1] + 1;
                        }
                        logger.info("#routes.stats.get.stats: Week number: %s", month);
                        var content;
                        content = "<h3>Game stats</h3><p>Currently Your game has been " + rows.length + " times played.</p>";
                        content += "<canvas id='chartjs-1' class='chartjs' width='1540' height='770' style='display: block; height: 385px; width: 770px;'></canvas>";
                        chartobj = {
                            type: 'bar',
                            data: {
                                labels: monthNames,
                                datasets: [{
                                    label: 'Gameplays',
                                    data: arr,
                                    backgroundColor: [
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0,5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)',
                                        'rgba(0, 0, 255, 0.5)'
                                    ],
                                    fill: true,
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: {
                                    yAxes: {
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            }
                        };
                        content += "" +
                            "<script>new Chart(document.getElementById('chartjs-1')," + JSON.stringify(chartobj) + ");</script>";

                        res.render("stats", {
                            title: 'Portal | Statistics',
                            version: version,
                            registeredUser: rows.length,
                            tag_body: content
                        });
                    }
                });
            }
        }
    });
});


const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


router.post('/game_add_1', [
    check('gamename').isLength({min:3, max:255}).withMessage('The game name should be between 3 and 255 char long'),
    check('gamedesc').isLength({min:3, max:512}).withMessage('The game description should be between 3 and 512 char long')
], function(req, res) {
    const gamename = req.body.gamename;
    const gamedesc = req.body.gamedesc;
    const gameurl = req.body.gameurl;

    var pattern = /^((http|https):\/\/)/;

    if(gameurl!="" && !pattern.test(gameurl)) {
        req.flash('danger', 'Please specify a proper URL starting with https:// or http://');
        res.redirect(req.headers.referer);

    }
    else {

        // ToDo Check image size, we really would like to have 640x400
        if (!MISC_validation(req)) {
            res.redirect(req.headers.referer);
        } else {
            // First we do some housekeeping and remove all older asset entries which are not yet op to stage 2
            // and more then an 10 min late
            var vsql = "DELETE FROM gameasset WHERE asset_creation < (NOW() - INTERVAL 180 MINUTE) AND asset_ready < 2";
            if (debugon)
                logger.info("SQL: %s", vsql);
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    if (debugon)
                        logger.error('Error: %s' + error);
                    throw error;
                } else {
                    var gametoken = MISC_maketoken(5);
                    var gamesecret = MISC_makeid(50);

                    // Stage one
                    var vsql = "INSERT INTO gameasset (userid, asset_ready, asset_name, asset_scheme, asset_periode, asset_token, asset_secret, asset_description, asset_url, asset_creation, asset_resolution, asset_firstblood) VALUES ('" + req.user.id + "', '0', '" + gamename + "','" + "" + "', '" + "" + "', '" + gametoken + "', '" + gamesecret + "', '" + gamedesc + "', '" + gameurl + "', '" + pool.mysqlNow() + "', '" + pool.mysqlNow() + "', 0)";
                    logger.info("SQL: %s", vsql);
                    pool.query(vsql, function (error, rows, fields) {
                        if (error) {
                            if (debugon)
                                logger.error('Error: %s' + error);
                            throw error;
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
    }
});

router.post('/game_add_2', function(req, res) {

        // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage, limits: 100000, fileFilter: imageFilter }).single('profile_pic');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        logger.info("#server.routes.game.post.game_add2: Upload function triggered.")
        if (req.fileValidationError) {
            logger.error("#server.routes.game.post.game_add2: Error: %s",req.fileValidationError);
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            logger.info("#server.routes.game.post.game_add2: "+req);
            console.log(req);
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            logger.error("#server.routes.game.post.game_add2: Error: %s",err);
            return res.send(err);
        } else if (err) {
            logger.error("#server.routes.game.post.game_add2: Error: %s",err);
            return res.send(err);
        }
        const asset_token = req.body.asset_token;
        mv(req.file.path, 'public/uploads/' + req.file.filename, function (err) {
            if (err) {
                if (debugon)
                    logger.error('Error: %s',err);
                throw err;
            }
            var vsql = "UPDATE gameasset SET asset_ready=1, asset_pic='" + 'uploads/' + req.file.filename + "' WHERE asset_token='" + asset_token + "'";
            if (debugon)
                logger.info("SQL: %s", vsql);
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    if (debugon)
                        logger.error('Error: %s',error);
                    throw error;
                } else {
                    logger.info("Next step");
                    // Display uploaded image for user validation
                    res.render('game_add_3', {
                        title: 'Portal | Step3 : Add game asset',
                        version: version,
                        asset_token: asset_token,
                        user: req.user
                    });

                }
            });

        });
    });
});

router.post('/game_add_3', [
    check('scheme').notEmpty().withMessage('Something went wrong: No gaming scheme'),
    check('periode').notEmpty().withMessage('Something went wrong: No gaming period'),
    check('wage').notEmpty().withMessage('Something went wrong: No waging specified'),
    check('player1').notEmpty().withMessage('Something went wrong: No player 1'),
    check('player2').notEmpty().withMessage('Something went wrong: No player 2'),
    check('player3').notEmpty().withMessage('Something went wrong: No player 3'),
    check('player4').notEmpty().withMessage('Something went wrong: No player 4'),
    check('player5').notEmpty().withMessage('Something went wrong: No player 5')
],function(req, res) {
    const asset_token =   req.body.asset_token;
    const asset_scheme =  req.body.scheme;
    const asset_partyperiod = req.body.periode;
    const asset_player1 = req.body.player1;
    const asset_player2 = req.body.player2;
    const asset_player3 = req.body.player3;
    const asset_player4 = req.body.player4;
    const asset_player5 = req.body.player5;
    const asset_options = 0;
    const asset_wage = req.body.wage;


    if (!MISC_validation(req)) {
        res.redirect('/game_add3');
    } else {
        var sum=Number(asset_player1) + Number(asset_player2) + Number(asset_player3) + Number(asset_player4) + Number(asset_player5);
        if (sum == 100) {
            logger.info("Update success");
            athGetAddress(function (error, athaddr) {
                if (error) {
                    req.flash('danger', 'Can not access blockchain');
                    res.render('game_add_3', {
                        title: 'Portal | Step3 : Add game asset',
                        version: version,
                        asset_token: asset_token,
                        user: req.user
                    });
                } else {
                    var vsql = "UPDATE gameasset SET asset_ready=2, asset_wage='" + asset_wage + "', asset_athaddr=" + pool.escape(athaddr) + ", asset_options=" + pool.escape(asset_options) + ", asset_scheme=" + pool.escape(asset_scheme) + ", asset_partyperiod=" + pool.escape(asset_partyperiod) + ", asset_player1=" + pool.escape(asset_player1) + ", asset_player2=" + pool.escape(asset_player2) + ", asset_player3=" + pool.escape(asset_player3) + ", asset_player4=" + pool.escape(asset_player4) + ", asset_player5=" + pool.escape(asset_player5) + " WHERE asset_token=" + pool.escape(asset_token);
                    if (debugon)
                        logger.info("SQL: %s", vsql);
                    pool.query(vsql, function (error, rows, fields) {
                        if (error) {
                            if (debugon)
                                logger.error('>>> Error: %s' + error);
                            throw error;
                        } else {
                            var sql = "SELECT * FROM gameasset WHERE asset_token = '" + asset_token + "'";
                            pool.query(sql, function (error, rows, fields) {
                                if (error) {
                                    if (debugon)
                                        logger.error('>>> Error: %s' + error);
                                    throw error;
                                } else {
                                    global.email
                                        .send({
                                            template: 'asset_creation',
                                            message: {
                                                to: req.user.email
                                            },
                                            locals: {
                                                name: rows2[0].displayname,
                                                date: pool.mysqlNow(),
                                                gamename: rows[0].asset_name,
                                                messagetext: 'Congratulations. A new game asset has been created. The gameasset have the game token id: ' + asset_token +
                                                    '. The game token comes also with a game secret. Both will be used to secure the communication in the GARP protocol.' +
                                                    ' Check out more information on our documentation platform: https://atheios.readthedocs.io/en/latest/gamedev_modules'
                                            }
                                        })
                                        .then(console.log)
                                        .catch(console.error);

                                    req.flash('info', 'Asset created');
                                    res.redirect('/currentgame');
                                }
                            });
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







router.post('/game_edit', [
    check('gametoken', 'Something went wrong: No asset token').notEmpty(),
    check('scheme', 'Something went wrong: No scheme').notEmpty(),
    check('wage', 'Something went wrong: No wage amount').notEmpty(),
    check('periode', 'Something went wrong: No periode').notEmpty(),
    check('player1', 'Something went wrong: No player 1').notEmpty(),
    check('player2', 'Something went wrong: No player 2').notEmpty(),
    check('player3', 'Something went wrong: No player 3').notEmpty(),
    check('player4', 'Something went wrong: No player 4').notEmpty(),
    check('player5', 'Something went wrong: No player 5').notEmpty(),
    check('gamedesc', 'Something went wrong: Missing game description').notEmpty(),
    check('gamename2', 'Something went wrong: Missing game name').notEmpty()
], function(req, res) {
    const asset_token = req.body.gametoken;
    const asset_scheme = req.body.scheme;
    const asset_partyperiod = req.body.periode;
    const asset_player1 = req.body.player1;
    const asset_player2 = req.body.player2;
    const asset_player3 = req.body.player3;
    const asset_player4 = req.body.player4;
    const asset_player5 = req.body.player5;
    const asset_description = req.body.gamedesc;
    const asset_url = req.body.gameurl;
    const asset_name = req.body.gamename2;
    const asset_wage = req.body.wage;

    var pattern = /^((http|https):\/\/)/;

    if(asset_url!="" && !pattern.test(asset_url)) {
        req.flash('danger', 'Please specify a proper URL starting with https:// or http://');
        res.redirect(req.headers.referer);
    }
    else {
        var sum = Number(asset_player1) + Number(asset_player2) + Number(asset_player3) + Number(asset_player4) + Number(asset_player5);
        logger.info("#routes.game.post.gameedit: Sum %s, %s, %s, %s, %s, %s", sum, asset_player1, asset_player2, asset_player3, asset_player4, asset_player5);
        if (sum == 100) {
            logger.info("Update success");

            if (!MISC_validation(req)) {
                res.redirect('/currentgame');
            } else {
                if (isNaN(asset_scheme) || isNaN(asset_partyperiod)) {
                    req.flash('danger', 'Please specify scheme and periode with the predefined values.');
                    res.redirect('/currentgame');
                } else {
                    var vsql = "UPDATE gameasset SET asset_wage=" + pool.escape(asset_wage) + ", asset_scheme=" + pool.escape(asset_scheme) + ", asset_partyperiod=" + pool.escape(asset_partyperiod) + ", asset_player1=" + pool.escape(asset_player1) + ", asset_player2=" + pool.escape(asset_player2) + ", asset_player3=" + pool.escape(asset_player3) + ", asset_player4=" + pool.escape(asset_player4) + ", asset_player5=" + pool.escape(asset_player5) + ", asset_description=" + pool.escape(asset_description) + ", asset_url=" + pool.escape(asset_url) + ", asset_name=" + pool.escape(asset_name) + " WHERE asset_token=" + pool.escape(asset_token);
                    if (debugon)
                        logger.info("SQL: %s", vsql);
                    pool.query(vsql, function (error, rows, fields) {
                        if (error) {
                            if (debugon)
                                logger.error('Error: %s' + error);
                        } else {
                            confmail = new Mail();
                            confmail.sendMail(req.user.email, "Atheios GDP: An existing asset has been updated: " + asset_name, 'You have updated an existing game asset.');
                            req.flash('info', 'Asset Updated');
                            res.redirect('/currentgame');
                        }
                    });
                }
            }
        } else {
            req.flash('danger', 'Check the player distribution, it shall be 100% in total.');
            res.redirect(req.headers.referer);

        }
    }
});

router.post('/remove_game', [
    check('gamename', 'Something went wrong: No asset name').notEmpty(),
    check('gametoken', 'Something went wrong: No asset token').notEmpty(),
    check('gamesecret', 'Something went wrong: No secret').notEmpty()
], function(req, res) {
    const asset_name = req.body.gamename;
    const asset_token = req.body.gametoken;
    const asset_secret = req.body.gamesecret;

    if (!MISC_validation(req)) {
        res.redirect('/currentgame');
    } else {
        var vsql = "UPDATE gameasset SET asset_ready='7' WHERE asset_token='" + asset_token +"' AND asset_secret='"+asset_secret+"'";
        if (debugon)
            logger.info("SQL: %s",vsql);
        pool.query(vsql, function (error, rows, fields) {
            if (error) {
                if (debugon)
                    logger.error('Error: %s' + error);
            } else {
                if (rows.affectedRows == 1) {
                    confmail = new Mail();
                    confmail.sendMail(req.user.email, "Atheios GDP: An existing asset has been delected: " + asset_name, 'Your game asset as been finally revoked.');
                    req.flash('info', 'Asset revoked');
                    res.redirect('/currentgame');
                } else {
                    req.flash('danger', 'Asset secret is not matching');
                    res.redirect('/currentgame');
                }
            }
        });

    }
});

router.post('/highlight_game', [
    check('gametoken', 'Something went wrong: No asset token').notEmpty(),
    check('gamesecret', 'Something went wrong: No secret').notEmpty()
], function(req, res) {
    const asset_token=req.body.gametoken;
    const asset_name=req.body.gamename;
    const asset_secret = req.body.gamesecret;
    const asset_period = req.body.gameperiod;
    const asset_pot = parseInt(req.body.pot);
    const asset_scheme = parseInt(req.body.scheme);


    if (!MISC_validation(req)) {
        res.redirect('/currentgame');
    } else {
        if (asset_pot>0 && asset_pot<100000) {
            if (asset_scheme>0 && asset_scheme<5) {
                // Check if there is a party mode enabled already
                var vsql = "SELECT * FROM gameasset WHERE asset_token=" + pool.escape(asset_token);
                logger.info("SQL: %s", vsql);
                pool.query(vsql, function (error, rows1, fields) {
                    if (error) {
                        logger.error('Error: %s' + error);
                        throw (error);
                    } else {
                        logger.info("%s",rows1[0].asset_partyscheme);
                        if (rows1.length == 1 && rows1[0].asset_partyscheme==0) {
                            var vsql = "UPDATE gameasset SET asset_partyperiod=" + pool.escape(asset_period) + ", asset_partypot=" + pool.escape(asset_pot) + ", asset_partyscheme=" + pool.escape(asset_scheme) + " WHERE asset_token=" + pool.escape(asset_token) + " AND asset_secret=" + pool.escape(asset_secret);
                            logger.info("SQL: %s", vsql);
                            pool.query(vsql, function (error, rows, fields) {
                                if (error) {
                                    logger.error('Error: %s' + error);
                                    throw (error);
                                } else {
                                    if (rows.affectedRows == 1) {
                                        email
                                            .send({
                                                template: 'asset_creation',
                                                message: {
                                                    to: req.user.email
                                                },
                                                locals: {
                                                    name: req.user.displayname,
                                                    date: pool.mysqlNow(),
                                                    gamename: asset_name,
                                                    messagetext: 'You will throw a party. A great idea. You are throwing in ' + asset_pot + ' coins for a period of ' + asset_scheme + '.'
                                                }
                                            })
                                            .then(console.log)
                                            .catch(console.error);

                                        req.flash('info', 'Party mode invoked.');
                                        res.redirect('/currentgame');
                                    } else {
                                        req.flash('danger', 'Asset secret is not matching');
                                        res.redirect('/currentgame');
                                    }
                                }
                            });
                        } else {
                            req.flash('danger', 'The party scheme is already invoked.');
                            res.redirect('/currentgame');
                        }
                    }
                });
            } else {
                req.flash('danger', 'Check Your period. should be between 1 and 4.');
                res.redirect('/currentgame');
            }
        } else {
            req.flash('danger', 'Check Your allocation, should be between 0 and 100000.');
            res.redirect('/currentgame');
        }

    }
});



module.exports = router;
