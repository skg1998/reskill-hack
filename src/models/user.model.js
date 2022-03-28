const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ENUM } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const { INTEGER, STRING, DATE, UUID, UUIDV4 } = DataTypes
    const User = sequelize.define("users", {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: STRING,
            allowNull: false
        },
        language: {
            type: ENUM(['EN', 'DE']),
            allowNull: false,
        },
        username: {
            type: STRING,
            allowNull: false,
        },
        password: {
            type: STRING,
            allowNull: false
        },
        mobile_no: {
            type: STRING
        },
        status: {
            type: ENUM(['Pending', 'Active']),
            defaultValue: 'Pending'
        },
        confirmationCode: {
            type: STRING,
            unique: true
        },
        role: {
            type: ENUM(['USER', 'ADMIN']),
            defaultValue: 'USER'
        },
        createdAt: {
            type: DATE,
            allowNull: false,
            defaultValue: new Date(),
            field: 'created_at'
        },
        updatedAt: {
            type: DATE,
            allowNull: false,
            defaultValue: new Date(),
            field: 'updated_at'
        }
    }, {
        hooks: {
            beforeCreate: async function (user, options) {
                const salt = await bcrypt.genSalt(10)
                user.password = bcrypt.hashSync(user.password, salt);
            },
            afterCreate: function (user, options) { }
        }
    });

    // Match user entered password to hashed password in database
    User.prototype.matchPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    //Sign jWT and return 
    User.prototype.getSignedJwtToken = function () {
        return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        })
    };

    return User
};