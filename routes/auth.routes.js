const express = require('express');
const authCtrl = require('./../controllers/auth.controller.js');

const router = express.Router()

router.route('/login')
  .post(authCtrl.signin)
router.route('/logout')
  .get(authCtrl.signout)

module.exports = router;
