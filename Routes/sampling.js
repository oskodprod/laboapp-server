const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const Sampling = require('../models/sampling');
const Sample = require('../models/sample');
const Labrat = require('../models/labrat');
const Report = require('../models/report');
const Client = require('../models/client');
const Rec = require('../models/rec');
const { update } = require('../models/sampling');

/*
    sampling
    req.body.docdate
    req.body.sid
    req.body.labrat (id) tylko przy tworzeniu
    req.body.comments
    req.body.samples

    sample[s]
    req.body.date
    req.body.chkDate
    req.body.agTime
    req.body.sxid
    req.body.rec (id)
    req.body.client (id)
    req.body.formSize
    req.body.testCon
    req.body.airPRC
    req.body.user (company id)
    req.body.WZ
    req.body.sCategory
    req.body.loc
    req.body.locDesc
*/

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}


//dodanie protokołu (async)
router.post("/", runAsync(async (req, res, next) => {

    const reqSampling = new Sampling({
        docDate: req.body.docDate,
        sid: req.body.sid,
        labrat: req.body.labrat,
        comments: req.body.comments,
        //samples: req.body.samples,
        //rec: req.body.rec,
        //client: req.body.client,
        sidHead: req.body.sidHead,
        sidLP: req.body.sidLP
    });

    async function checkDB()
    {
        const fSampling = await Sampling.findOne({ sidHead: req.body.sidHead, sidLP: req.body.sidLP })
        if(fSampling) { res.status(401).json({ message: "Sampling already exists"})}
        else
        {
            LPValue = await Sampling.find({ sidHead: req.body.sidHead }).sort({ sidLP: -1 }).limit(1);
            if (LPValue.length==0) reqSampling.sidLP = 1; else reqSampling.sidLP = LPValue[0].sidLP+1;
            reqSampling.sid = reqSampling.sidHead+reqSampling.sidLP;
            fRec = await Rec.findOne({ recName: req.body.rec })
            if(!fRec) { res.status(404).json({ message: "Recipe not found" }) } 
            else
            {

                fClient = await Client.findOne({ clName: req.body.client })
                if(!fClient) { res.status(404).json({ message: "Client not found" }) } 
                else
                {
                    fLabrat = await Labrat.findOne({ user: req.body.labrat })
                    if(!fLabrat){ res.status(404).json({ message: "Labrat not found" }) } 
                    else
                    {
                        reqSampling.rec = fRec._id;
                        reqSampling.labrat = fLabrat._id;
                        reqSampling.client = fClient._id;
                        cResult = await reqSampling.save()
                        res.status(200).json({created: cResult, id: cResult._id });
                    }
                }
            }
        }
    }
    
    await checkDB();
}))

//edycja protokołu (async)
router.put("/:id",  runAsync(async (req, res, next) => {

    var fSampling = new Sampling();
    var arSamples;
    async function updateSampling()
    {
        fSampling = await Sampling.findById(req.params.id)
        if(!fSampling){ res.status(404).json({ message: "Sampling doesn't exist"}) }
        else
        {
            const fixDay = 4*60*60000;
            dateFix = new Date();
            dateFix = Date.parse(req.body.docDate);
            dateFix += fixDay;
            await fSampling.updateOne({
                docDate: dateFix,//req.body.docDate,
                sid: req.body.sid,
                rec: req.body.rec,
                labrat: req.body.labrat,
                client: req.body.client,
                comments: req.body.comments,
                //samples: req.body.samples,
                sidHead: req.body.sidHead,
                sidLP: req.body.sidLP,
                loc: req.body.loc,
                locDesc: req.body.locDesc,
                mak: req.body.mak,
                sxMak: req.body.sxMak
            },{ omitUndefined: true, runValidators: true, context: 'query' })
            arSamples = await Sample.updateMany(
                { _id: { $in: fSampling.samples } },
                {
                    date: dateFix,
                    rec: req.body.rec,
                    labrat: req.body.labrat,
                    client: req.body.client,
                    comm1: req.body.comments,
                    loc: req.body.loc,
                    locDesc: req.body.locDesc,
                    mak: req.body.mak,
                    sxMak: req.body.sxMak,
                    //chkDate: samples. + fSampling.docDate
                },
                { omitUndefined: true, runValidators: true, context: 'query' },
            );
        }
    }

    async function result()
    {
        fResult = await Sampling.findById(req.params.id).deepPopulate('samples')
        res.status(200).json({updated: fResult});
    }
    
    await updateSampling();
    //await patchChkDate();
    await result();
}))

//ustawienie czasu badania
router.patch("/:id",  runAsync(async (req, res, next) => {
    
    var oldChkDate = new Date();
    var docDate = new Date();
    var agTime = new Number;

    docDate = Date.parse(req.body.docDate);
    agTime = req.body.agTime;
    docDate += agTime*24*60*60000 + 3*60*60000;
    //var newChkDate = new Date();
    //newChkDate.setDate(docDate);

    //var newChkDate = new Date();
    //newChkDate.setDate(docDate.getDate() + agTime)
    var sample = new Sample();

    async function update()
    {
        sample = await Sample.findById(req.params.id);
        oldChkDate = sample.chkDate;
        sample = await Sample.findByIdAndUpdate(req.params.id, { chkDate: docDate });
    }

    async function result()
    {
        sample = await Sample.findById(req.params.id);
        if(sample) res.status(200).json({ old: oldChkDate, new: sample.chkDate });
    }
    //res.status(200).json({ old: docDate, new: docDate });
    await update();
    await result();
}))

//usunięcie protokołu (async)
// !! -> usunięcie protokołu pobrania spowoduje usunięcie z db powiązanych z nim próbek i sprawozdania
router.delete("/:id",  runAsync(async (req, res, next) => {
    
    var reportDeleted = false;
    var samplesDeleted;
    //var loopPasses = 0;
    var fSampling = await Sampling.findById(req.params.id);
    
    async function deleteReport()
    {
        var dReport = await Report.findOneAndDelete({ sampling: fSampling._id })
        if(dReport) reportDeleted = true;
    }

    async function deleteSamples()
    {
        samplesDeleted = await Sample.deleteMany({ _id: { $in: fSampling.samples } });
    }

    async function deleteSampling()
    {
        fSampling.remove();
        res.status(200).json({
            reportDeleted: reportDeleted,
            samplesDeleted: samplesDeleted,
            //loopPasses: loopPasses,
            deleted: fSampling
        });
    }
    
    await deleteReport();
    await deleteSamples();
    await deleteSampling();
}))


//lista nazw receptur
router.get("/recNames", runAsync(async (req,res,next) => {

    async function getNames()
    {
        names = await Rec.find().select('recName');
        if(names.length==0) { res.status(404).json({message: "no rec"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//lista nazw budów/klientów
router.get("/clNames", runAsync(async (req,res,next) => {

    async function getNames()
    {
        names = await Client.find().populate('company', 'name').select('clName clAddress clCity cid company.name');
        if(names.length==0) { res.status(404).json({message: "no clients"}) }
        else { res.status(200).json({names: names}) }
    }

    await getNames();
}))

//protokoły z datą
router.get("/dates", runAsync(async(req,res,next) => {

    async function filterSamplings()
    {
        //var start = new Date;
        //var end = new Date;
        start = new Date(Number(req.query.start)); //Date.parse(req.params.start);
        end = new Date(Number(req.query.end))//Date.parse(req.params.end);
        //console.log(`param: ${req.query.start}\nparam: ${req.query.end}`);
        //console.log(`start: ${start}\nend: ${end}`);
        //console.log()
        fList = await Sampling.find({"docDate": {"$gte": start, "$lte": end}})
        //fList = await Sampling.find({"sid": "2021/6/P/TB/1"})
        .deepPopulate('samples labrat.labo labrat.user rec.maker client.company client.user')
        .then(filtered => {
            if(filtered.length==0)
            { res.status(404).json({ flag: 404, message: "Samplings not found" })} //; console.log('Samples not found')
            else 
            { res.status(200).json( {filtered: filtered})} //; console.log('Found Samples')
        }).catch(err => { res.status(500).json({ flag: 500, error: err, loc: "find error" } )}); //; console.log('loc error')
    }

    await filterSamplings();
}))

//szczegóły protokołu (fullres, async)
router.get("/:id", runAsync(async (req,res,next) => {

    async function sSampling()
    {
        var fSampling = await Sampling.findById(req.params.id)
        .deepPopulate('samples labrat.labo labrat.user rec.maker client.company client.user')
        if (fSampling)
        {
            res.status(200).json({found: fSampling});
        } else { res.status(404).json({ message: "Sampling not found" })}
    }
    await sSampling();
}))

//lista protokołów (async)
router.get("/", runAsync(async (req,res,next) => {

    async function list()
    {
        fList = await Sampling.find().sort({ docDate: 'desc' }).populate('labrat').populate('rec').deepPopulate('client.company')
        if(fList.length==0) { res.status(404).json({message: "no samplings"}) }
        else { res.status(200).json({ message: "fetched samplings list", list: fList })}
    }
    
    await list();
}))

//.catch(err => { res.status(500).json({ error: err, loc: "" } ) });

module.exports = router;