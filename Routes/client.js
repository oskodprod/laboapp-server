const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
const Client = require('../models/client');
const Company = require('../models/company');
const User = require('../models/user');

    /*
    client
    req.body.clName             "clName": "Budowa"  (U)
    req.body.clAddress          "clAddress": "Adres 3"
    req.body.clCity             "clCity": "Warszawa"
    req.body.short              "short": "Adres"
    req.body.iniShort           "iniShort": "BA"
    req.body.cid:               "cid": "2021/WAW/ATRA/ADRES"   (U)
    req.body.contactname:       "contactname": "Kierownik"
    req.body.contactlastname:   "contactlastname": "Budowlany"
    req.body.contactTelNo:      "contactTelNo": "226564345"
    
    company
    req.body.name               "name": "Atrabud",

    user
    req.body.email              "email": "KB@atrabud.test" (U)
    req.body.password           "password": "123456"
    */

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

//dodanie klienta/budowy (async)
router.post("/", runAsync(async (req,res,next) => {

    var fCompany = new Company();
    var fClient = new Client();
    var fUser = new User();
    var password;
    const reqClient = new Client({
        clName: req.body.clName,
        clAddress: req.body.clAddress,
        clCity: req.body.clCity,
        short: req.body.short,
        iniShort: req.body.iniShort,
        cid: req.body.cid,
        contactname: req.body.contactname,
        contactlastname: req.body.contactlastname,
        contactTelNo: req.body.contactTelNo
    });

    async function hashPD() { password = await bcrypt.hash(req.body.password, 10); await create(); }
    async function create()
    {
        const reqUser = new User(
        {
            email: req.body.email,
            password: password
        });
        cUResult = await reqUser.save();
        reqClient.user = cUResult._id;
        cCResult = await reqClient.save();
        res.status(200).json({created: cCResult});
    }
    async function checkDB()
    {
        if(req.body.clName && req.body.cid && req.body.email && req.body.name && req.body.password)
        {
            fCompany = await Company.findOne({ name: req.body.name });
            fClient = await Client.findOne({ clName: req.body.clName });
            fUser = await  User.findOne({ email: req.body.email });
            if( fCompany && !fClient )
            { 
                reqClient.company = fCompany._id;
                fClient = await Client.findOne({ cid: req.body.cid });
                fUser = await User.findOne({ email: req.body.email });
                if(fClient || fUser) { res.status(401).json({ message: "User with given mail or Client with given ID already exists." }); }
                else await hashPD();
            } else res.status(401).json({ message: "Company not found in DB or Client with given name already exist." });
        } else res.status(401).json({ message: "Insufficient Data" });
    }
    await checkDB();
}))

//edycja klienta/budowy (async)
router.put("/:id", runAsync(async (req,res,next) => {

    var fCompany = new Company();
    var fClient = new Client();
    var fUser = new User();
    var password;

    async function result()
    {
        fResult = await Client.findById(req.params.id).populate('company').populate('user', 'email')
        res.status(200).json({updated:fResult})
    }

    async function update()
    {
        await fUser.updateOne({ email: req.body.email }, { omitUndefined: true, runValidators: true, context: 'query' })
        await fClient.updateOne(
            {
                clName: req.body.clName,
                clAddress: req.body.clAddress,
                clCity: req.body.clCity,
                short: req.body.short,
                iniShort: req.body.iniShort,
                cid: req.body.cid,
                contactname: req.body.contactname,
                contactlastname: req.body.contactlastname,
                contactTelNo: req.body.contactTelNo,
                company: fCompany._id
            }, { omitUndefined: true, runValidators: true, context: 'query' }
        )

        await result();
    }

    async function hashPD() { password = await bcrypt.hash(req.body.password, 10) }
    async function checkDB()
    {
        fClient = await Client.findById(req.params.id)
        fCompany = await Company.findOne({ name: req.body.name, category: "wyko" });

        if(!fClient){ res.status(404).json({ message: "Client not found" }) }
        else
        {
            if(!fCompany){ res.status(404).json({ message: "Company not found" }) }
            else
            {
                fUser = await User.findOne({ _id: fClient.user });
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

//usunięcie klienta
router.delete("/:id", checkAuth, (req, res, next) => {

    const noUser = false;
    Client.findById(req.params.id)
    .then(client =>
    {
        if(!client){ res.status(401).json({ message: "Client not found" }); return; }
        else
        {
            User.findById(client.user)
            .then(user => 
            {
                if(!user){ noUser = true; }
                else { user.remove(); }      

                client.remove()
                .then( deleted => 
                {
                    if(noUser){res.status(200).json({message: "User not found, Client deleted from db", deleted: deleted}); return;}
                    else {res.status(200).json({message: "Client deleted from db", deleted: deleted}); return; }
                }).catch(err => { res.status(500).json({ error: err } ) });

            }).catch(err => { res.status(500).json({ error: err } ) });           
        }
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//szczegóły klienta (fullres)
router.get("/:id",  (req,res,next) => {
    Client.findById(req.params.id).populate('company').populate('user', 'email')
    .then(client =>
    {
        if(!client){ res.status(401).json({ message: "Client doesn't exist" }); return; }
        else {res.status(200).json({client: client, name: client.company.name, email: client.user.email});}
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//lista klientów
router.get("/", (req,res,next) => {
    Client.find().populate('company', 'name').populate('user', 'email' )
    .then(list => 
    {
        if(!list){ res.status(404).json({ message: "no clients found" }); return;}
        else{ res.status(200).json({ message: "Client list", clientList: list });}
    }).catch(err => { res.status(500).json({ error: err } ) });
})

//.catch(err => { res.status(500).json({ error: err } ) });

module.exports = router;