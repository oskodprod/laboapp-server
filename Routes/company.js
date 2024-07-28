const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const Company = require('../models/company');

/*{
    "name": "Atrabud", (U)
    "address": "Budowniczowie 21",
    "postalcode": "71-380",
    "city": "Warszawa",
    "nip": "1112223334",
    "category": "wyko"
}*/

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

router.post("/",  (req, res, next) => {
        
        const reqCompany = new Company({
            name: req.body.name,
            address: req.body.address,
            postalcode: req.body.postalcode,
            city: req.body.city,
            nip: req.body.nip,
            category: req.body.category
        });

        Company.findOne({ name: req.body.name })
        .then( company => {
            if(company){ return res.status(500).json({ message: "Company with given name already exists" })}
            reqCompany.save().then( result => {
                if(!result){ return res.status(500).json({ message:"Company create error" }) }
                res.status(201).json({
                    message: "Company created.",
                    result: result
                });
            })
            .catch(err => {
                res.status(500).json({
                  error: err
                });
            });

        })
        .catch(err => {
            res.status(500).json({
              error: err
            });
        });
        
})


//edycja firmy
router.put("/:id",  (req, res, next) => {
    
    Company.findById(req.params.id)
    .then(comp => 
    {
        if(!comp){ res.status(404).json({ message: "Company doesn't exist" }); return; }
        else
        {
            comp.name = req.body.name;
            comp.address = req.body.address;
            comp.postalcode = req.body.postalcode;
            comp.city = req.body.city;
            comp.nip = req.body.nip;
            comp.category = req.body.category;

            comp.isNew = false; comp.save({ runValidators: true, context: 'query'})
            .then(result => 
            {
                res.status(200).json({updated: result});
            }).catch(err => { res.status(500).json({ error: err, loc: "duplicate error" } ) });
        }
    }).catch(err => { res.status(500).json({ error: err, loc: "no company" } ) });
})

//usunięcie firmy
router.delete("/:id",  (req, res, next) => {
    Company.findById(req.params.id)
    .then(comp => 
    {
        if(!comp){ res.status(404).json({ message: "Company not found" }); return; }
        else
        {
            comp.remove()
            .then( result => 
            {
                res.status(200).json({message: "Company deleted from db", deleted: result});
            }).catch(err => { res.status(500).json({ error: err, loc: "remove error" } ) });
        }
    }).catch(err => { res.status(500).json({ error: err, loc: "no company" } ) });
})

//lista nazw laboratoriów (async)
router.get("/laboNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Company.find({ category: "labo" }).select('name')
        if(names.length==0) { res.status(404).json({message: "no labos"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//lista nazw wykonawców (async)
router.get("/wykoNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Company.find({ category: "wyko" }).select('name')
        if(names.length==0) { res.status(404).json({message: "no wyko"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//lista nazw producentów (async)
router.get("/prodNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Company.find({ category: "prod" }).select('name')
        if(names.length==0) { res.status(404).json({message: "no prod"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//szczegóły firmy
router.get("/:id",  (req,res,next) => {
    Company.findById(req.params.id)
    .then(comp =>
    {
        if(!comp){ res.status(404).json({ message: "Company doesn't exist" }); return; }
        else {res.status(200).json({company: comp});}
    }).catch(err => { res.status(500).json({ error: err, loc: "no company" } ) });
})

//lista firm
router.get("/", (req,res,next) => {
    Company.find()
    .then(list =>
    {
        if(!list){{ res.status(404).json({ message: "no companies found" }); return;}}
        else{ res.status(200).json({ message:"fetched companies list", list: list });}
    }).catch(err => { res.status(500).json({ error: err, loc: "no company" } ) });
})

router.delete(":/id", checkAuth, runAsync(async (req,res,next) => {

    var fCompany;

    async function deleteCompany()
    {
        fCompany = await Company.findByIdAndRemove(req.params.id)
        if(!fCompany) { res.status(404).json({ message: "Company not found" }) }
        else { res.status(200).json({ message:"Company deleted from db.", deleted: fCompany}); }
    }
    await deleteCompany();
}))

//.catch(err => { res.status(500).json({ error: err, loc: "" } ) });

module.exports = router;