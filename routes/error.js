var express = require('express');
var router = express.Router();

/* GET documentation pages */
router.get('/error', function(req, res, next) {
    res.render('error', {
        title: 'Error',
        version: version
    });
});

module.exports = router;