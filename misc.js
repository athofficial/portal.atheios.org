const { validationResult } = require('express-validator');
const logger = require("./logger");

exports.MISC_validation=function(req) {
    var i;

    const errorFormatter = ({location, msg, param, value, nestedErrors}) => {
        // Build your resulting errors however you want! String, object, whatever - it works!
        return `Error: ${msg} for ${param}`;
    };

    var errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
        var errorstr = "";
        for (i = 0; i < errors.array().length; i++) {
            errorstr += errors.array()[i];
            if (i < errors.array().length - 1) {
                errorstr += ", ";
            }

        }
        logger.error("Error in validation: %", errorstr);
        req.flash('danger', errorstr);
        return(false);
    }
    return(true);
};

// Access Control
exports.MISC_ensureAuthenticated=function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/login');
    }
}




// Generates 5 tuples of type length
// XXXXX-XXXXX-XXXXX ...
exports.MISC_maketoken = function(length) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i=0;i<length;i++) {
        for (var j = 0; j < 5; j++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        text += "-";
    }
    text = text.substring(0, text.length - 1);
    return text;
}

exports.MISC_makeid = function(length) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

