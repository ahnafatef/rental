const User = require('./../models/user.js');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('./../config/config.js');
const flash = require('connect-flash');

const signin = (req, res) => {
  User.findOne({
    "email": req.body.email
  }, (err, user) => {
    /*     if (err || !user)
    return res.status('401').json({
      error: "User not found"
    }) */
    
      if (err || !user){
        req.flash('error', 'Invalid user');
        return res.redirect('/login');
      }

/*     if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: "Email and password don't match."
      })
    } */

    if (!user.authenticate(req.body.password)) {
      req.flash('error', 'Email and password don\'t match');
      return res.redirect('/login');
    }    

    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret)

    res.cookie("t", token, {
      expire: new Date() + 9999
    })

/*     return res.json({
      token,
      user: {_id: user._id, name: user.name, email: user.email}
    }) */
    res.flash('success', {token, user});
    return res.redirect('/userhome', {user: user});

  })
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

module.exports = {
  'signin':signin,
  'signout':signout,
  'requireSignin':requireSignin,
  'hasAuthorization':hasAuthorization
}