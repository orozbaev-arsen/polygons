const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (Server) => {
  const router = new express.Router();

  router.get('/login', () => {

  });

  router.post('/signin', async (req,res) =>{
    const user = await Server.user.getByUsername(req.body.username);
    if (user) {
      const isMatch = await Server.user.checkPassword({password: req.body.password, hash: user.password});
      if(isMatch){
        const token=jwt.sign({username: user.username}, Server.config.auth.token, {
          expiresIn: Server.config.auth.sessionTime,
        });
        res.cookie('authorization', `Bearer ${token}`, { maxAge:  Server.config.auth.sessionTime * 1000, httpOnly: true });
        res.redirect('/')
      }
      else{
        res.status(400).json({message:'Invalid Password/Username'});
      }
    } else {
      res.status(400).json({message:'User not found'});
    }
  });

/////////////////***USER_REGISTER***//////////////////////
// router.post('/register', async(req,res) => {
//   let user = req.body;
//   if (user.password) {
//     user.password = bcrypt.hashSync(user.password, 10);
//   }
//   await Server.collection('users').insertOne(user);
//   res.json({status: 'Ok'});
// });
//////////////////////////////////////////////////////////


  return router;
};
