const express = require('express');
const router = express.Router();
const Database=require('../database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {athGetAddress, athGetBalance, athdoWithdraw} = require('../ath');
const { check, validationResult } = require('express-validator');
const logger = require("../logger");

// Serve stats page
router.get('/stats', function(req, res){
    var i;
    var month;
    var weekarr=[];
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var vsql = "SELECT *, DATE_FORMAT(register, \"%m\") AS startdate FROM user ORDER BY register";
    pool.query(vsql, function (error, rows, fields) {
        if (error) {
            logger.error('#routes.stats.get.stats: Error: %s', error);
            req.flash('danger', 'An error occured: ' + error);
            res.redirect('/');
        } else {

            for (i=0;i<12;i++) {
                weekarr[i] = 0;
            }
            d= new Date();
            month= d.getMonth();
            for (i=0;i<rows.length;i++) {
                console.log("%s: %s", i, rows[i].startdate);
                weekarr[parseInt(rows[i].startdate)-1]=weekarr[parseInt(rows[i].startdate)-1]+1;
            }
            logger.info("#routes.stats.get.stats: Week number: %s", month);
            var content;
            content= "<h3>User stats</h3><p>Currently there are " + rows.length + " users registered.</p>";
            content+= "<canvas id='chartjs-1' class='chartjs' width='1540' height='770' style='display: block; height: 385px; width: 770px;'></canvas>";
            chartobj={
                type: 'bar',
                data: {
                    labels: monthNames,
                    datasets: [{
                        label: 'New registered users',
                        data: weekarr,
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
            content+= "<script>new Chart(document.getElementById('chartjs-1')," + JSON.stringify(chartobj) + ");</script>";
            var vsql = "SELECT *, DATE_FORMAT(gameplay_start_date, \"%m\") AS startdate FROM gameplay ORDER BY gameplay_start_date";
            pool.query(vsql, function (error, rows, fields) {
                if (error) {
                    logger.error('#routes.stats.get.stats: Error: %s', error);
                    req.flash('danger', 'An error occured: ' + error);
                    res.redirect('/');
                } else {

                    for (i = 0; i < 12; i++) {
                        weekarr[i] = 0;
                    }
                    d = new Date();
                    month = d.getMonth();
                    for (i = 0; i < rows.length; i++) {
                        console.log("%s: %s", i, rows[i].startdate);
                        weekarr[parseInt(rows[i].startdate) - 1] = weekarr[parseInt(rows[i].startdate) - 1] + 1;
                    }
                    logger.info("#routes.stats.get.stats: Week number: %s", month);
                    content += "<h3>Game stats</h3><p>Currently there are " + rows.length + " games played.</p>";
                    content += "<canvas id='chartjs-2' class='chartjs' width='1540' height='770' style='display: block; height: 385px; width: 770px;'></canvas>";
                    chartobj = {
                        type: 'bar',
                        data: {
                            labels: monthNames,
                            datasets: [{
                                label: 'Games played',
                                data: weekarr,
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
                        "<script>new Chart(document.getElementById('chartjs-2')," + JSON.stringify(chartobj) + ");</script>";

                    for (i = 0; i < 12; i++) {
                        weekarr[i] = 0;
                    }
                    var totamount=0;
                    d = new Date();
                    month = d.getMonth();
                    for (i = 0; i < rows.length; i++) {
                        console.log("%s: %s", i, rows[i].startdate);
                        totamount+=rows[i].amount;
                        weekarr[parseInt(rows[i].startdate) - 1] = weekarr[parseInt(rows[i].startdate) - 1] + rows[i].amount;
                    }
                    logger.info("#routes.stats.get.stats: Week number: %s", month);
                    content += "<h3>Game waging</h3><p>Currently there are " + totamount + " ATH waged played.</p>";
                    content += "<canvas id='chartjs-3' class='chartjs' width='1540' height='770' style='display: block; height: 385px; width: 770px;'></canvas>";
                    chartobj = {
                        type: 'bar',
                        data: {
                            labels: monthNames,
                            datasets: [{
                                label: 'ATH waged',
                                data: weekarr,
                                backgroundColor: [
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0,5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)',
                                    'rgba(0, 128, 255, 0.5)'
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
                        "<script>new Chart(document.getElementById('chartjs-3')," + JSON.stringify(chartobj) + ");</script>";

                    res.render("stats", {
                        title: 'Portal | Statistics',
                        version: version,
                        registeredUser: rows.length,
                        tag_body: content
                    });
                }
            });
        }
    });
});

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}
module.exports = router;