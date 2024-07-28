const express = require('express')
const User = require('../models/user')
const Labrat = require('../models/labrat')
const Client = require('../models/client')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const router = express.Router();

function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });

      User.findOne({email:req.body.email}).then(user1=>{
        if(user1){
          return res.status(401).json({
            message: "User Already Exist"
          })
        }

        user.save().then(result => {
          if(!result){
            return res.status(500).json({
              message: "Error Creating User"
            })
          }
          res.status(201).json({
            message: "User created!",
            result: result
          });
      })
        })   
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });;
    })
   
  });


  router.post("/login", (req, res, next) => {
    let fetchedUser;
  
    User.findOne({email:req.body.email}).then(user=>{
      if(!user){
        return res.status(401).json({
          message: "Auth failed no such user"
        })
      }
      fetchedUser=user;
      return bcrypt.compare(req.body.password, user.password);
    }).then(result=>{
      if(!result){
        return res.status(401).json({
          message: "Auth failed inccorect password"
        })
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.SECRET,
        { expiresIn: "2h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 7200,
        userId: fetchedUser._id
      });
    })
    .catch(e=>{
     
      console.log(e)
    
    })
  })

//znajdź zalogowanego laboranta/klienta
router.get("/:id", runAsync(async (req,res,next) => {

  async function FindUser()
  {
    var fLabrat = new Labrat();
    var fClient = await Client.findOne({ user: req.params.id }).populate('company', 'name').populate('user', 'email' )
    if(fClient) {res.status(200).json({loggedClient: fClient});}
    else
    {
      fLabrat = await Labrat.findOne({ user: req.params.id }).populate('labo', 'name').populate('user', 'email' )
      if(fLabrat) {res.status(200).json({loggedLabrat: fLabrat});}
      else { res.status(404).json({ message: "no such user found" });}
    }
  }
  
  await FindUser()
}))
module.exports = router