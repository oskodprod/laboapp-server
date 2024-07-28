const express = require('express');
const router = new express.Router();
const checkAuth = require("../middlewares/check-auth");
const Sampling = require('../models/sampling');
const Sample = require('../models/sample');
const Rec = require('../models/rec');
const Client = require('../models/client');
const Company = require('../models/company');
const Report = require('../models/report');
//const { find } = require('../models/sampling');

//async wrapper
function runAsync (cb)
{   
    return function(req, res, next)
    { cb(req,res,next).catch(next) }
}

//dodanie próbek (async)
router.post("/",  runAsync(async (req, res, next) => {
    //const noData = false;
    
    //var fRec = new Rec();
    //var fClient = new Client();
    //var fUser = new Company();
    var created = [];
    async function checkDupl()
    {
        const reqSample = new Sample({
            date: req.body.date,
            chkDate: req.body.chkDate,
            rec: req.body.rec,
            client: req.body.client,
    
            agTime: req.body.agTime,
            //sxid: req.body.sxid,
            sxHead: req.body.sxHead,
            sxLP: req.body.sxLP,
            //rec: rec._id,
            //client: client._id,
            formSize: req.body.formSize,
            //
            tLoad: req.body.tLoad,
            tCheck: req.body.tCheck,
            airTemp: req.body.airTemp,
            mixTemp: req.body.mixTemp,
            formNo: req.body.formNo,
            thermo: req.body.thermo,
            //
            laboTemp: req.body.laboTemp,
            precForm: req.body.precForm,
            precSide: req.body.precSide,
            precUpDown: req.body.precUpDown,
            precFlat: req.body.precFlat,
            precPerpSide: req.body.precPerpSide,
            precComm: req.body.precComm,
            wymComm: req.body.wymComm,
            destSpeed: req.body.destSpeed,
            destSpeedCheck: req.body.destSpeedCheck,
            destComm: req.body.destComm,
            comm1: req.body.comm1,
            testedBy: req.body.testedBy,
            //
            testCon: req.body.testCon,
            airPRC: req.body.airPRC,
            //
            //user: comp._id,
            WZ: req.body.nrWZ,
            sCategory: req.body.sCategory,
            loc: req.body.loc,
            locDesc: req.body.locDesc,
            //
            mass: req.body.mass,
            wymA: req.body.wymA,
            wymB: req.body.wymB,
            wymC: req.body.wymC,
            //
            destForce: req.body.destForce,
            destResult: req.body.destResult,
            destType: req.body.destType,
            //
            sxMak: req.body.sxMak,
            mak: req.body.mak,
            //
            sampling: req.body.sid,
            comm1: req.body.comm1
        });
        LPValue = await Sample.find({ sxHead: req.body.sxHead }).sort({ sxLP: -1 }).limit(1);
        if (LPValue.length==0) reqSample.sxLP = 1; else reqSample.sxLP = LPValue[0].sxLP+1;
        reqSample.sxid = reqSample.sxHead+reqSample.sxLP;
        
        var dateFix = new Date();
        var reqagTime = new Number;
        dateFix = reqSample.date;
        reqagTime = req.body.agTime;
        if( (req.body.agTime != undefined) || (req.body.agTime > 0) )
        {   
            dateFix.setDate(dateFix.getDate() + reqagTime);
            reqSample.chkDate = dateFix;
        }

        if(reqSample.sxid)
        {
        const Duplicate = await Sample.findOne({ sxid: reqSample.sxid })
        if(Duplicate){ res.status(401).json({ message: "Sample already exists" }) }
        else
        {
            reqSample.isNew = true;
            addToSampling = await Sampling.findOne({ _id: req.body.sid })
            reqSample.date = addToSampling.docDate
            cResult = await reqSample.save();
            created.push(cResult);
            
            addToSampling.samples.push(cResult._id); await addToSampling.save()
        }
        } else res.status(401).json({ message: "empty Sample ID" })
    }
    for (let index = 0; index < req.body.sxIT; index++) {
        await checkDupl();            
    }
    res.status(200).json({created: created});
    
}))

//edycja próbki (async test)(async works)
router.put("/:id",  runAsync(async (req, res, next) => {

    const found = new Sample();
    var updated = false;
    var noData = [];
    async function assign()
    {
        if(req.body.recName)
        {
            const fRec = await Rec.findOne({ recName: req.body.recName })
            if(fRec) found.rec = fRec._id;
            else noData.push({ notFound: "Recipe" });
        }
        if(req.body.clName)
        {
            const fClient = await Client.findOne({ clName: req.body.clName })
            if(fClient) found.client = fClient._id;
            else noData.push({ notFound: "Client" });
        }
        if(req.body.name)
        {
            const fUser = await Company.findOne({ name: req.body.name })
            if(fUser) found.user = fUser._id;
            else noData.push({ notFound: "Company" });
        }
    }
    
    async function update()
    {
        const fSample = await Sample.findByIdAndUpdate(req.params.id)
        if (fSample)
        {
            var dateFix = new Date();
            var reqagTime = new Number;
            dateFix = fSample.date;
            reqagTime = req.body.agTime;
            if (!req.body.tested){
                if( (req.body.agTime != undefined) && (req.body.agTime > 0) )
                {   dateFix.setDate(dateFix.getDate() + reqagTime);   }
            }
            else 
            { 
                dateFix = req.body.chkDate;
                const copyDate = new Date(dateFix);
                copyDate.setHours(copyDate.getHours()+2);
                dateFix = copyDate;
            }
            await fSample.updateOne({ 
                date: req.body.date,
                chkDate: dateFix,
                agTime: req.body.agTime,
                sxid: req.body.sxid,
                sxHead: req.body.sxHead,
                sxLP: req.body.sxLP,
                rec: found.rec,
                client: found.client,
                formSize: req.body.formSize,
                //
                tLoad: req.body.tLoad,
                tCheck: req.body.tCheck,
                airTemp: req.body.airTemp,
                mixTemp: req.body.mixTemp,
                formNo: req.body.formNo,
                thermo: req.body.thermo,
                //
                laboTemp: req.body.laboTemp,
                precForm: req.body.precForm,
                precSide: req.body.precSide,
                precUpDown: req.body.precUpDown,
                precFlat: req.body.precFlat,
                precPerpSide: req.body.precPerpSide,
                precComm: req.body.precComm,
                wymComm: req.body.wymComm,
                destSpeed: req.body.destSpeed,
                destSpeedCheck: req.body.destSpeedCheck,
                destComm: req.body.destComm,
                comm1: req.body.comm1,
                testedBy: req.body.testedBy,
                //
                testCon: req.body.testCon,
                airPRC: req.body.airPRC,
                //
                user: found.user,
                WZ: req.body.nrWZ,
                sCategory: req.body.sCategory,
                loc: req.body.loc,
                locDesc: req.body.locDesc,
                //
                mass: req.body.mass,
                wymA: req.body.wymA,
                wymB: req.body.wymB,
                wymC: req.body.wymC,
                //
                destForce: req.body.destForce,
                destResult: req.body.destResult,
                destType: req.body.destType
                }, { omitUndefined: true, runValidators: true, context: 'query' })
            updated = true;
        }
        await result();
    }
    async function result()
    { 
        fResult = await Sample.findById(req.params.id)
        res.status(200).json({updated, noData, fResult});
    }
    await assign();
    await update();
    //await checkDB();
}))

//usunięcie próbki
router.delete("/:id",  runAsync(async(req, res, next) => {

    const foundSample = await Sample.findById(req.params.id)
    if(!foundSample){ res.status(404).json({message: "Sample doesn't exist"}) }
    else
    {
        let foundSampling = await Sampling.findById(foundSample.sampling);
        let foundReports = await Report.find({ sampling: mongoose.Types.ObjectId(foundSampling._id) })
        .cursor()
        .eachAsync(async function(rep) {
            rep.samples.pull({ _id: foundSample._id });
            await rep.save();
        })
        //foundReports.samples.pull({ _id: foundSample._id });
        foundSampling.samples.pull({ _id: foundSample._id });
        await foundSampling.save();
        await dbRemove();
    }
    
    async function dbRemove()
    {
        foundSample.remove()
        .then(result => 
        {
            res.status(200).json({ message: "Sample deleted from db" , deleted: result})
        }).catch(err => { res.status(500).json({ error: err, loc: "remove error" } ) });
    }
}))

//lista badań próbek, rozdzielana datami
router.get("/", runAsync(async(req,res,next) => {

    async function filterSamples()
    {
        //var start = new Date;
        //var end = new Date;
        start = new Date(Number(req.query.start)); //Date.parse(req.params.start);
        end = new Date(Number(req.query.end))//Date.parse(req.params.end);
        //console.log(`param: ${req.query.start}\nparam: ${req.query.end}\nparam: ${req.query.flag}`);
        //console.log(`start: ${start}\nend: ${end}`);
        //console.log()
        if(req.query.flag == 'date')
        {
            fList = await Sample.find({"date": {"$gte": start, "$lte": end}})
            .deepPopulate('rec.maker client.company client.user user')
            .then(filtered => {
                if(!filtered)
                { res.status(404).json({ flag: 404, message: "Samples not found" })} //; console.log('Samples not found')
                else 
                { res.status(200).json( {filtered: filtered})} //; console.log('Found Samples')
            }).catch(err => { res.status(500).json({ flag: 500, error: err, loc: "find error" } )}); //; console.log('loc error')
        }
        if(req.query.flag == 'chk')
        {
            fList = await Sample.find({"chkDate": {"$gte": start, "$lte": end}})
            .deepPopulate('rec.maker client.company client.user user')
            .then(filtered => {
                if(!filtered)
                { res.status(404).json({ flag: 404, message: "Samples not found" }) }
                else 
                { res.status(200).json({ filtered: filtered }) }
            }).catch(err => { res.status(500).json({ flag: 500, error: err, loc: "find error" } ) });
        }
    }

    await filterSamples();
}))

//szczegóły próbki (fullres)
router.get("/:id",  (req,res,next) => {

    Sample.findById(req.params.id).deepPopulate('rec.maker client.company client.user user')
    .then( fullres => 
    {
        if(!fullres){ res.status(404).json({ message: "Sample doesn't exist"}) }
        else { res.status(200).json({ found:fullres}) };
    }).catch(err => { res.status(500).json({ error: err, loc: "population error" } ) });
})

//lista próbek
//router.get("/", (req,res,next) => {})

//.catch(err => { res.status(500).json({ error: err, loc: "" } ) });

module.exports = router;