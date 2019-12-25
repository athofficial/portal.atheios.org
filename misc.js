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

