const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    //Get the Token from header
    const token = req.header('x-auth-token');

    //check if no token
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    //Verify Token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        console.log("this is decoded", decoded);

        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid '});
    }
}