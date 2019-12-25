var express = require('express');
var router = express.Router();

/* GET documentation pages */
router.get('/onboarding', function(req, res, next) {
    res.render('onboarding', {
        title: 'Home',
        version: version
    });
});

module.exports = router;