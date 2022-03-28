const jwt = require('jsonwebtoken')
const { User } = require('../models');
const ErrorResponse = require('../util/errorResponse');

exports.hasAuthenticate = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1]
    }

    //Make sure token exist
    if (!token) {
        return next(new ErrorResponse('Not Authorized to access this route', 401))
    }
    try {
        //verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decode.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Not Authorized to access this route', 401))
    }
}

//Grant access to role
exports.hasAuthorize = (...roles) => {
    return async (req, res, next) => {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user || !roles.includes(user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is Not Authorized to access this route`, 403))
        }
        next();
    }
}