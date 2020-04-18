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
            console.log(games);
            res.json(games);
        }
    });
});

module.exports = router;