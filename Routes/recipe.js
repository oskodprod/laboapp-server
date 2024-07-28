const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
//const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
const Rec = require('../models/rec');
const Company = require('../models/company');

/*
    recipe
    req.body.recName    "recName": "37C5/W8", (U)
    req.body.clS        "clS": "C30/37",
    req.body.con        "con": "S3",
    req.body.clW        "clW": "W8",
    req.body.clF        "clF": "",
    req.body.cert       "cert": true,
    req.body.agTime     "agTime": 28,
    req.body.clX        "clX": ["XC3","XD1","XA1","XS2","XF1"],
    req.body.clN        "clN": "",
    req.body.comments   "comments": "test",

    company
    req.body.name       "name": "BestBet"
*/
//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

//dodanie receptury
router.post("/",  (req, res, next) => {

    Rec.findOne({ recName: req.body.recName })
    .then(result =>
    {
        if(result){ res.status(400).json({ message: "Recipe already exist" }); return; }
        else
        {
            Company.findOne({ name: req.body.name, category: "prod" })
            .then(result =>
            {
                if(!result){ res.status(404).json({ message: "Company doesn't exist" }); return; }
                else
                {
                    const reqRecipe = new Rec({
                        recName: req.body.recName,
                        clS: req.body.clS,
                        con: req.body.con,
                        clW: req.body.clW,
                        clF: req.body.clF,
                        cert: req.body.cert,
                        agTime: req.body.agTime,
                        clX: req.body.clX,
                        clN: req.body.clN,
                        comments: req.body.comments,
                        maker: result._id
                    });

                    reqRecipe.save({ runValidators: true, context: 'query' })
                    .then(result =>
                    {
                        res.status(200).json({
                        message: "Recipe created",
                        result: result
                        });
                    }).catch(err => { res.status(500).json({ error: err, loc: "add error" } ) });
                }
            }).catch(err => { res.status(500).json({ error: err, loc: "no company" } ) });
        }
    }).catch(err => { res.status(500).json({ error: err, loc: "recipe duplicate" } ) });
})

router.put("/:id", runAsync(async (req,res,next) => {

    var fCompany = new Company();
    var fRec = new Rec();

    async function result()
    {
        fResult = await Rec.findById(req.params.id).populate('maker')
        res.status(200).json({updated:fResult})
    }

    async function update()
    {
        await fRec.updateOne(
            {
                recName: req.body.recName,
                clS: req.body.clS,
                con: req.body.con,
                clW: req.body.clW,
                clF: req.body.clF,
                cert: req.body.cert,
                agTime: req.body.agTime,
                clX: req.body.clX,
                clN: req.body.clN,
                comments: req.body.comments,
                maker: fCompany._id
            }, {  runValidators: true, context: 'query' }
            )
        await result();
    }
    async function checkDB()
    {
        fRec = await Rec.findById(req.params.id)
        fCompany = await Company.findOne({ name: req.body.name, category: "prod" });

            if(!fCompany){ res.status(404).json({ message: "Company not found" }) }
            else await update();
    }

    await checkDB();
}))

//szczegóły receptury (fullres)
router.get("/:id",  (req,res,next) => {
    Rec.findById(req.params.id).populate('maker')
    .then(recipe =>
    {
        if(!recipe){ res.status(404).json({ message: "Recipe doesn't exist" }); return; }
        else {res.status(200).json({recipe: recipe, name: recipe.maker.name});}
    }).catch(err => { res.status(500).json({ error: err, loc: "find error" } ) });
})

//lista receptur
router.get("/", (req,res,next) => {
    Rec.find().populate('maker', 'name')
    .then(list => 
    {
        if(!list){ res.status(404).json({ message: "no recipes found" }); return;}
        else{ res.status(200).json({ message: "fetched recipes list", list: list });}
    }).catch(err => { res.status(500).json({ error: err, loc: "population error" } ) });
})

router.delete("/:id", checkAuth, runAsync(async (req,res,next) => {

    var fRec;
    async function deleteRecipe()
    {
        fRec = await Rec.findByIdAndRemove(req.params.id)
        if(!fRec) { res.status(404).json({ message: "Recipe not found" }) }
        else { res.status(200).json({ message:"Recipe deleted from db.", deleted: fRec}); }
    }
    await deleteRecipe()
}))

//.catch(err => { res.status(500).json({ error: err, loc: "" } ) });

module.exports = router;