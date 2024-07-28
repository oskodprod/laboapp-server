const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
const Labrat = require('../models/labrat');
const Company = require('../models/company');
const User = require('../models/user');

    /*{
    labrat
    req.body.pName      "pName": "Test2",
    req.body.lastname   "lastname": "laborant",
    req.body.iniShort   "iniShort": "T2",
    req.body.isAdmin    "isAdmin": false,

    company
    req.body.name       "name": "CFB Laboratorium",

    user
    req.body.email      "email": "labrat2@test.com",    (U)
    req.body.password   "password": "abcdef"
    } */

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

//dodanie laboranta
router.post("/",  (req, res, next) => {

    const reqLabrat = new Labrat({
        pName: req.body.pName,
        lastname: req.body.lastname,
        iniShort: req.body.iniShort,
        isAdmin: req.body.isAdmin
    });

    Company.findOne({ name: req.body.name, category: "labo" })
    .then(result => 
    {
        if(!result){ res.status(500).json({ message: "Company doesn't exist" }); return; }
        else 
        {
            reqLabrat.labo = result._id;
            User.findOne({email:req.body.email})
            .then(user1=>
            {
                if(user1){ res.status(401).json({ message: "User Already Exist" }); return; }
                else
                {
                    bcrypt.hash(req.body.password, 10)
                    .then(hash => 
                    {
                        const reqUser = new User({
                        email: req.body.email,
                        password: hash
                        });
                        reqUser.save()
                        .then(result => 
                        {
                            if(!result){ res.status(500).json({ message: "Error Creating User" }); return; }
                            else 
                            {
                                reqLabrat.user = reqUser._id;
                                reqLabrat.save()
                                .then( result => 
                                {
                                    res.status(200).json({
                                    message: "Labrat created",
                                    result: result
                                    });
                                }).catch(err => { res.status(500).json({ error: err } ) });
                            }
                        }).catch(err => { res.status(500).json({ error: err } ) });
                    }).catch(err => { res.status(500).json({ error: err } ) });

                }
            }).catch(err => { res.status(500).json({ error: err } ) });
        }
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//edycja klienta/budowy (async)
router.put("/:id", runAsync(async (req,res,next) => {

    var fCompany = new Company();
    var fLabrat = new Labrat();
    var fUser = new User();
    var password;

    async function result()
    {
        fResult = await Labrat.findById(req.params.id).populate('labo').populate('user', 'email')
        res.status(200).json({updated:fResult})
    }

    async function update()
    {
        await fUser.updateOne({ email: req.body.email }, { omitUndefined: true, runValidators: true, context: 'query' })
        await fLabrat.updateOne(
            {
                pName: req.body.pName,
                isAdmin: req.body.isAdmin,
                iniShort: req.body.iniShort,
                lastname: req.body.lastname,
                labo: fCompany._id
            }, { omitUndefined: true, runValidators: true, context: 'query' }
        )

        await result();
    }

    async function hashPD() { password = await bcrypt.hash(req.body.password, 10) }
    async function checkDB()
    {
        fLabrat = await Labrat.findById(req.params.id)
        fCompany = await Company.findOne({ name: req.body.name, category: "labo" });

        if(!fLabrat){ res.status(404).json({ message: "Labrat not found" }) }
        else
        {
            if(!fCompany){ res.status(404).json({ message: "Company not found" }) }
            else
            {
                fUser = await User.findOne({ _id: fLabrat.user });
                if(!fUser){ res.status(404).json({ message: "User not found" }) }
                else
                {
                    if(req.body.password != null)
                    {
                        await hashPD();
                        await fUser.updateOne({ password: password }, { omitUndefined: true, runValidators: true, context: 'query' })
                    }
                    await update();
                }
            }
        }
    }

    await checkDB();
}))

//usunięcie laboranta
router.delete("/:id", checkAuth, (req, res, next) => {

    const noUser = false;
    Labrat.findById(req.params.id)
    .then(labrat =>
    {
        if(!labrat){ res.status(401).json({ message: "Labrat not found" }); return; }
        else
        {
            User.findById(labrat.user)
            .then(user => 
            {
                if(!user){ noUser = true; }
                else { user.remove(); }      

                labrat.remove()
                .then( deleted => 
                {
                    if(noUser){res.status(200).json({message: "User not found, Labrat deleted from db", deleted: deleted}); return;}
                    else {res.status(200).json({message: "Labrat deleted from db", deleted: deleted}); return; }
                }).catch(err => { res.status(500).json({ error: err } ) });

            }).catch(err => { res.status(500).json({ error: err } ) });           
        }
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//szczegóły laboranta (fullres)
router.get("/:id",  (req,res,next) => {
    Labrat.findById(req.params.id).populate('labo', 'name').populate('user', 'email')
    .then(labrat =>
    {
        if(!labrat){ res.status(401).json({ message: "Labrat doesn't exist" }); return; }
        else {res.status(200).json({labrat: labrat, name: labrat.labo.name, email: labrat.user.email});}
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//lista laborantów
router.get("/", (req,res,next) => {
    Labrat.find().populate('labo', 'name').populate('user', 'email')
    .then(list => 
    {
        if(!list){ res.status(404).json({ message: "no labrats found" }); return;}
        else{ res.status(200).json({ message: "fetched labrat list", list: list} );}
    })
})

//.catch(err => { res.status(500).json({ error: err } ) });

module.exports = router;