const { User } = require("../models");
const ErrorResponse = require('../util/errorResponse');
const sendEmail = require('../util/sendEmail');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');


/**
 * 
 * @desc create User account 
 * @route POST api/v1/users/register
 * @access Public
 */

exports.register = async (req, res, next) => {
    try {
        const { name, username, password, conform_password, mobile_no, language } = req.body;

        //check email is valid or not
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        if (!emailRegexp.test(username)) {
            return res.render('register', { message: "Username must be email type" })
        }

        //check for unique email
        const unique_username = await User.findOne({ where: { username: username } });
        if (unique_username) {
            return res.render('register', { message: "Username must be unique" })
        }

        //check for password length
        if (password.length < 8) {
            return res.render('register', { message: "Password length must be greater than or equal to 8" })
        }
        //check password and conform password
        if (password !== conform_password) {
            return res.render('register', { message: "Password and conform Password must be same" })
        }

        //check mobile number is valid or not
        if (!(mobile_no.length === 10)) {
            return res.render('register', { message: "Please check your mobile number" })
        }

        //generate code for email validation
        const confirmationCode = jwt.sign({ username: req.body.username }, process.env.JWT_SECRET);
        const user = await User.create({ name, username, password, mobile_no, confirmationCode, language });

        //target link to email validate
        const emailVerification = `${req.protocol}://${req.get('host')}/api/v1/users/confirm/${confirmationCode}`;

        const messageEN =
            `<p>Dear ${name}</p>
         <p>Please <a href=${emailVerification}> Click here</a> here to verify your email.</p>
         <p> Thanks </p>
         `

        const messageDE =
            `<p>Lieber ${name}</p>
         <p>Bitte <a href=${emailVerification}> klicken Sie hier</a> , um Ihre E-Mail-Adresse zu bestätigen</p>
         <p> Vielen Dank </p>
         `

        try {
            //send email to usermail
            await sendEmail({
                email: user.username,
                subject: "Please confirm your account",
                message: user.language === 'EN' ? messageEN : messageDE
            })

            return res.render('register', {
                success: true,
                message: 'Email has been sent to your registered email !'
            })

        } catch (err) {
            await user.save({ validateBeforeSave: false })
            return res.render('register', {
                success: false,
                message: 'Email could not be sent !'
            })
        }
    } catch (err) {
        next(err);
    }
}

/** 
 * 
 * @desc login to account
 * @route POST api/v1/users/login
 * @access Public
 */
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        //Validate email & password
        if (!username && !password) {
            return res.render('login', {
                message: "Please Provide an username and password",
            });
        }

        // Check for user
        const user = await User.findOne({ where: { username: username } });

        //Check for valid user
        if (!user) {
            return res.render('login', {
                message: "Invalid credentials User not found",
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.render('login', {
                message: "Password Not match!",
            });
        }

        //check for status
        if (user.status != "Active") {
            return res.render('login', {
                message: "Pending Account. Please Verify Your Email!",
            });
        }

        //check for admin
        if (user.role === "ADMIN") {
            const allUser = await User.findAll({
                limit: 10,
                raw: true
            })

            return res.render('allUser', { allUser: allUser });
        }

        sendTokenResponse("LOGIN", user, 200, res, "login  successfully !");
    } catch (err) {
        next(err);
    }
}

exports.verifyUser = async (req, res, next) => {
    const user = await User.findOne({ where: { confirmationCode: req.params.confirmationCode } })
    if (!user) {
        res.status(400).json({ message: "Not found" });
    }

    // set user status
    user.status = "Active";
    await user.save();

    return res.render('verification', { message: "Your account has been verified. Click here to login" })
};


//get token from model, create cookie and send response
const sendTokenResponse = (type, user, statusCode, res, message) => {
    //Create Token
    const token = user.getSignedJwtToken();
    const option = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        option.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, option)
        .render('profile',
            {
                success: true,
                token: token,
                message: message,
                user: user
            })
}


/** 
 * 
 * @desc Get user data
 * @route POST api/v1/users/getuser
 * @access Public
 */
exports.getUserData = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { username: req.body.username } })
        if (!user) {
            res.status(400).json({ message: "User Not found" });
        }

        res.status(201).json({
            success: true,
            user: user
        })
    } catch (err) {
        next(err);
    }
}