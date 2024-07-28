const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const Formfield = require('../models/formfield');
/*
{
    "category": "Miejsce betonowania",
    "value": "płyta fundamentowa"
}
*/

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

router.get("/clsNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Ściskanie" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no clS"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/conNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Konsystencja" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no con"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/clwNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Wodoszczelność" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no clW"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/clfNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Mrozoodporność" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no clF"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/agTimes", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Okres badań" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no agTime"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/clxNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Klasa ekspozycji" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no clX"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/clnNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Nasiąkliwość" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no clN"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/formNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Wymiary formy" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no formSize"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/locNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Miejsce betonowania" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no loc"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/makNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Metoda zagęszczenia" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no mak"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

router.get("/sxmakNames", runAsync(async (req,res,next) => {
    
    async function getNames()
    {
        names = await Formfield.find({ category: "Wykonawca próbek" }).select('value')
        if(names.length==0) { res.status(404).json({message: "no mak"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//lista pozycji formularza
router.get("/", (req,res,next) => {
    Formfield.find().then(list => {
        if(list){
            res.status(200).json({
                message: "Fetched fields list.",
                fieldList: list
            });
        }
        else{ res.status(404).json({ message: "no written formfields"});}
    });
});

//dodanie pozycji formularza
router.post("/",  (req,res,next) => {

    const reqField = new Formfield({
        category: req.body.category,
        value: req.body.value
    });

    Formfield.findOne({ category: req.body.category, value: req.body.value })
    .then( field => {
        if(field){ return res.status(500).json({ message: "Formfield already exists" }) }
        else
        {
            reqField.save()
            .then( result => 
            {
                if(!result){ return res.status(500).json({ message:"Field create error" }) }
                res.status(201).json({
                    message: "Field created.",
                    result: result
                });
            })
            .catch(err => { res.status(500).json({ error: err }) });
        }
    })
    .catch(err => {
        res.status(500).json({
          error: err
        });
    });
})

//usunięcie pozycji formularza
router.delete("/:id", (req,res,next) => {
    
    Formfield.findById(req.params.id)
    .then(field => 
    {
        if(!field){ res.status(404).json({ message: "Field not found" }); return; }
        else
        {
            field.remove()
            .then( result => 
            {
                res.status(200).json({message: "Field deleted from db", deleted: result});
            }).catch(err => { res.status(500).json({ error: err, loc: "remove error" } ) });
        }
    }).catch(err => { res.status(500).json({ error: err, loc: "no field" } ) });
})

module.exports = router;