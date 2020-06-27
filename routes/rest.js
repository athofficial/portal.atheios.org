var express = require('express');
var logger = require('../logger');

var router = express.Router();

/* GET home page. */

router.get('/rest/games', function(req, res, next) {
    var games = {
        'games': [],
    };
    var i;
    var sql = "SELECT *,TIMESTAMPDIFF(SECOND, asset_resolution, UTC_TIMESTAMP()) AS secs FROM gameasset WHERE asset_ready=2";
    logger.info("#server.routes.rest.get.games: SQL: %s", sql);
    pool.query(sql, async (error, rows, fields) => {
        if (error) {
            logger.error("#server.routes.rest.get.games: Error: %s", error);
            throw(error);
        } else {
            logger.info("##server.routes.rest.get.games: Games active: %s", rows.length);
            // For all active game assets
            for (i = 0; i < rows.length; i++) {
                // Time to trigger payment
                var timeleft = (parseInt(rows[i].asset_periode) * 3600) - rows[i].secs;
                var tl = timeleft;
                var tldays = parseInt(timeleft / 3600 / 24);
                tl = timeleft -= tldays * 3600 * 24;
                var tlhour = parseInt(timeleft / 3600);
                timeleft -= tlhour * 3600;
                var tlmin = parseInt(timeleft / 60);
                timeleft -= tlmin * 60;


                logger.info("#server.routes.rest.get.games: Secs left: %s %s. %dd%dh%dm", tl, rows[i].asset_name, tldays, tlhour, tlmin);
                var devpercent = rows[i].asset_scheme;

                logger.info("#server.routes.rest.get.games: Game resolution: %s", rows[i].asset_name);
                // Find the top gameplays for the game asset which are not yet resolved (gameplay_option=2)
                var sql = "SELECT * FROM gameplay WHERE gameplay_options=2 AND gameasset_id=" + rows[i].id + " ORDER BY gameplay_score DESC";
                logger.info("#server.routes.rest.get.games: SQL: %s", sql);
                try {
                    var rows1 = await pool.query(sql);
                    if (rows1.length > 0) {
                        logger.info("#server.routes.rest.get.games: Gameplays available %s", rows1.length);
                        // Now we have
                        // rows: list of active game asset data
                        // rows1: list of played games for this asset
                        var payout = 0;
                        for (j = 0; j < rows1.length; j++) {
                            payout += rows1[j].amount;
                        }
                        games.games.push({
                            "name": rows[i].asset_name,
                            "secondsleft": tl,
                            "url": rows[i].asset_url,
                            "picurl": "https://portal.atheios.org/public/uploads/" + rows[i].asset_pic,
                            "currentpayout": payout,
                        });

                        logger.info("#server.app.gameresolution: Payout: %i", payout);
                    } else {
                        games.games.push({
                            "name": rows[i].asset_name,
                            "secondsleft": tl,
                            "url": rows[i].asset_url,
                            "picurl": "https://portal.atheios.org/public/uploads/" + rows[i].asset_pic,
                            "currentpayout": 0,
                        });

                    }
                } catch (error) {
                }


            }
            res.json(games);
        }
    });
});



router.get('/rest/stats', function(req, res, next) {
    var i;
    var sql = "SELECT *,TIMESTAMPDIFF(SECOND, asset_resolution, UTC_TIMESTAMP()) AS secs FROM gameasset";
    logger.info("#server.routes.rest.get.stats: SQL: %s", sql);
    pool.query(sql, async (error, rows, fields) => {
        if (error) {
            logger.error("#server.routes.rest.get.stats: Error: %s", error);
            throw(error);
        } else {
            logger.info("##server.routes.rest.get.games: Games active: %s", rows.length);
            // For all active game assets
            var asset_scheme_50=0;
            var asset_scheme_60=0;
            var asset_scheme_70=0;
            var asset_scheme_80=0;
            var asset_scheme_90=0;
            var asset_scheme_100=0;
            var periode_1=0;
            var periode_3=0;
            var periode_6=0;
            var periode_12=0;
            var periode_24=0;
            var periode_48=0;
            var periode_72=0;
            var periode_96=0;
            var periode_148=0;
            var periode_296=0;
            var wage_1=0;
            var wage_5=0;
            var wage_10=0;
            var wage_25=0;
            var wage_50=0;
            var wage_100=0;
            var nrofgames_notready=0;

            for (i = 0; i < rows.length; i++) {
                if (rows[i].asset_ready==2) {
                    switch (rows[i].asset_scheme) {
                        case "0.5":
                            asset_scheme_50++;
                            break;
                        case "0.6":
                            asset_scheme_60++;
                            break;
                        case "0.7":
                            asset_scheme_70++;
                            break;
                        case "0.8":
                            asset_scheme_80++;
                            break;
                        case "0.9":
                            asset_scheme_90++;
                            break;
                        case "1":
                            asset_scheme_100++;
                            break;
                    }
                    switch (rows[i].asset_periode) {
                        case "1":
                            periode_1++;
                            break;
                        case "3":
                            periode_3++;
                            break;
                        case "6":
                            periode_6++;
                            break;
                        case "12":
                            periode_12++;
                            break;
                        case "24":
                            periode_24++;
                            break;
                        case "48":
                            periode_48++;
                            break;
                        case "72":
                            periode_72++;
                            break;
                        case "96":
                            periode_96++;
                            break;
                        case "148":
                            periode_148++;
                            break;
                        case "296":
                            periode_296++;
                            break;
                    }
                    switch (rows[i].asset_wage) {
                        case 1:
                            wage_1++;
                            break;
                        case 5:
                            wage_5++;
                            break;
                        case 10:
                            wage_10++;
                            break;
                        case 25:
                            wage_25++;
                            break;
                        case 50:
                            wage_50++;
                            break;
                        case 100:
                            wage_100++;
                            break;
                    }
                } else {
                    nrofgames_notready++;
                }
            }
            var vsql = "SELECT * FROM gameplay";

            logger.info("#server.routes.rest.get.stats: SQL: %s", vsql);
            pool.query(vsql, async (error, rows1, fields) => {
                if (error) {
                    logger.error("#server.routes.rest.get.stats: Error: %s", error);
                    throw(error);
                } else {
                    var stats = {
                        'nrofgameassets': rows.length,
                        'nrofgamesnotready': nrofgames_notready,
                        'scheme_50': asset_scheme_50,
                        'scheme_60': asset_scheme_60,
                        'scheme_70': asset_scheme_70,
                        'scheme_80': asset_scheme_80,
                        'scheme_90': asset_scheme_90,
                        'scheme_100': asset_scheme_100,
                        'periode_1': periode_1,
                        'periode_3': periode_3,
                        'periode_6': periode_6,
                        'periode_12': periode_12,
                        'periode_24': periode_24,
                        'periode_48': periode_48,
                        'periode_72': periode_72,
                        'periode_96': periode_96,
                        'periode_148': periode_148,
                        'periode_296': periode_296,
                        'wage_1': wage_1,
                        'wage_5': wage_5,
                        'wage_10': wage_10,
                        'wage_25': wage_25,
                        'wage_50': wage_50,
                        'wage_100': wage_100,
                        'nrofgameplays': rows1.length
                    };

                    console.log(stats);
                    res.json(stats);
                }
            });
        }
    });
});

module.exports = router;