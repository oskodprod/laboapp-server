const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
//const Sampling = require('../models/sampling');
const Sample = require('../models/sample');
const Rec = require('../models/rec');
const Client = require('../models/client');
const Company = require('../models/company');
const Report = require('../models/report');

/*
    req.body.docDate
    req.body.rid
    req.body.sampling (id)
    req.body.avgEnd
    req.body.samples [id]
    req.body.fckEnd
    req.body.minEnd
    req.body.odchStd
    req.body.niepewnosc
    req.body.createdBy
*/

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

//dodanie sprawozdania (async)
router.post("/",  runAsync(async (req, res, next) => {

    const reqReport = new Report({
        docDate: req.body.docDate,
        rid: req.body.rid,
        sampling: req.body.sampling,
        samples: req.body.samples,
        avgEnd: req.body.avgEnd,
        //critAvgFck: req.body.critAvgFck,
        fckEnd: req.body.fckEnd,
        minEnd: req.body.minEnd,
        odchStd: req.body.odchStd,
        niepewnosc: req.body.niepewnosc,
        createdBy: req.body.createdBy
        //comments: req.body.comments
    })

    async function saveReport()
    {
        fReport = await Report.findOne({ rid: reqReport.rid })
        if(fReport){ res.status(401).json(
        { message: "Report with such ID already exist. Change ID of report and try again." }) }
        else
        { 
            cResult = await reqReport.save()
            res.status(200).json({ created: cResult });
        }
    }

    await saveReport();
}))

//edycja sprawozdania (async)
/*router.put("/:id",  runAsync(async (req, res, next) => {

    var fReport;
    async function updateReport()
    {
        fReport = await Report.findById(req.params.id)
        if(!fReport){ res.status(404).json({ message: "Report doesn't exist"}) }
        else
        {
            await fReport.updateOne({
                docDate: req.body.docDate,
                rid: req.body.rid,
                sampling: req.body.sampling,
                avgEnd: req.body.avgEnd,
                //critAvgFck: req.body.critAvgFck,
                fckEnd: req.body.fckEnd,
                minEnd: req.body.minEnd,
                odchStd: req.body.odchStd,
                niepewnosc: req.body.niepewnosc,
                createdBy: req.body.createdBy,
                //comments: req.body.comments
            },{ omitUndefined: true, runValidators: true, context: 'query', })
        }
    }

    async function result()
    {
        fReport = await Report.findById(req.params.id);
        if(!fReport){ res.status(500).json({ message: "report update error" }) }
        else { res.status(200).json(fReport) }
    }
    
    await updateReport();
    await result();
}))*/

//usunięcie sprawozdania (async)
router.delete("/:id",  runAsync(async (req, res, next) => {

    var fReport;
    async function deleteReport()
    {
        fReport = await Report.findByIdAndRemove(req.params.id)
        if(!fReport) { res.status(404).json({ message: "Report not found" }) }
        else { res.status(200).json({ deleted: fReport }) }
    }

    await deleteReport();
}))

//szczegóły sprawozdania (fullres, async)
router.get("/:id",  runAsync(async (req,res,next) => {

    var fReport;
    async function getReport()
    {
        fReport = await Report.findById(req.params.id)
        .deepPopulate('sampling.labrat.user sampling.labrat.labo sampling.client.company sampling.client.user sampling.rec.maker samples.client.company samples.client.user samples.user')
        if(!fReport) { res.status(404).json({ message: "Report not found" }) }
        else { res.status(200).json({ found: fReport }); }
    }

    await getReport();
}))

//lista sprawozdań
router.get("/", runAsync(async (req,res,next) => {

    var fReports;
    start = new Date(Number(req.query.start));
    end = new Date(Number(req.query.end));
    async function getReports()
    {
        fReports = await Report.find({"docDate": {"$gte": start, "$lte": end}})
        .deepPopulate('sampling.labrat.user sampling.labrat.labo sampling.client.company sampling.client.user sampling.rec.maker samples.client.company samples.client.user samples.user')
        .then(filtered => {
            if(filtered.length==0)
            { res.status(404).json({ flag: 404, message: "Reports not found" })} //; console.log('Samples not found')
            else 
            { res.status(200).json( {filtered: filtered})} //; console.log('Found Samples')
        }).catch(err => { res.status(500).json({ flag: 500, error: err, loc: "find error" } )}); //; console.log('loc error')
    }

    await getReports();
}))

//.catch(err => { res.status(500).json({ error: err, loc: "" } ) });

module.exports = router;