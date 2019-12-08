const express = require('express');
const userCtrl = require('./../controllers/user.controller.js');
const authCtrl = require('./../controllers/auth.controller.js');

const router = express.Router()

// /user/
router.route('/signup')
  .get(userCtrl.list)
  .post(userCtrl.create)

// router.route('/:userId')
//   .get(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.read)
//   .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
//   .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)
router.route('/:userId')
  .get(userCtrl.read, function(req, res){
    // console.log(req.profile);
    return res.render('ownerhome', {user: req.profile});
  })
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

// router.route('/ownerhome')
//   .get(userCtrl.list)

router.param('userId', userCtrl.userByID)

module.exports = router;
