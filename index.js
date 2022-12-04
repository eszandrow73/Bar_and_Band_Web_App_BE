//const Client = require('pg').Client
const {Client} = require('pg')

const PORT = 8999
//import Express from 'express'
const express = require('express')
const cors = require('cors')
/*
const axios = require("axios")
const cheerio = require("cheerio")
const path = require('path')
const cors = require('cors')
*/

app = express()
app.use(cors());

const client = new Client({
    user: "postgres",
    password: "P@125362a",
    host: "localhost",
    port:5432,
    database:"postgres"
})

const barClient = new Client({
    user: "postgres",
    password: "P@125362a",
    host: "localhost",
    port:5432,
    database:"barMusicApp"
})

async function makeConnect(){
    barClient.connect().then((res)=>{
        //console.log(res)
        console.log("Connected to DB")
        return res
    })
    //console.log(output)
    //return output
}

var connectionDB = makeConnect()
//host = DESKTOP-AFM2IKG ?

//postgres://postgres:P@125362a@localhost:5432/testData
//'SELECT * FROM public."testTable"')

app.get('/', async(req , res ) => {
    //res.html(html_example)
    html_test = "<html><h1>Bar and Band API for Postgres Database</h1></html>"
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(html_test));
})

app.get('/barData', async(req, res)=>{
    
    var outData = {}

    //testtable
    /*barClient.connect()
    .then(()=>{
        console.log("Connected to Local Database")
    }).then(()=> barClient   
    */
   barClient.query("select * from public.barData")
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows)
        console.log(dbRes.rows)
        outData = dbRes.rows
        /*
        barClient.end()
        .then(() => {
            console.log('client has disconnected')
        })
        .catch(err => console.error('error during disconnection', err.stack))
        */
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).then(async()=>{
        res.json(outData)
    })
    
    //res.json(outData)
})

app.get('/bandData', async(req, res)=>{
    
    var outData = {}

    //testtable
    /*
    barClient.connect()
    .then(()=>{
        console.log("Connected to Local Database")
    }).then(()=> barClient.
    */
   barClient.query("select * from public.bandData")
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows)
        console.log(dbRes.rows)
        outData = dbRes.rows
        /*
        barClient.end()
        .then(() => {
            console.log('client has disconnected')
        })
        .catch(err => console.error('error during disconnection', err.stack))
        */
        
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).finally(async ()=>{
        res.json(outData)
    })
    
    //res.json(outData)
})

app.get('/addBand', async(req, res)=>{
    
    var inputList = req.query
    console.log(inputList)
    console.log(inputList.input)
    console.log(inputList.input[1])
    var addToDB = ""
    addToDB = " VALUES(" + inputList.input[0] + ", '"
    addToDB = addToDB + inputList.input[1] + "', '"
    addToDB = addToDB + inputList.input[2] + "', '"
    addToDB = addToDB + inputList.input[3] + "', '"
    addToDB = addToDB + inputList.input[4] + "');"
    console.log(addToDB)
    var outData = {}
   barClient.query('INSERT INTO public.banddata (id, spotify, website, "style", members)'+ addToDB)
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows)
        console.log(dbRes.rows)
        outData = dbRes.rows
        /*
        barClient.end()
        .then(() => {
            console.log('client has disconnected')
        })
        .catch(err => console.error('error during disconnection', err.stack))
        */
        
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).finally(async ()=>{
        res.json(outData)
    })
    

})

app.get('/fetest', async(req, res)=>{
    console.log(req.query)
    var output = {"out":"basic_test"}
    res.json(output)
})

app.get('/test', async(req, res)=>{
    
    var outData = {}

    //testtable
    client.connect()
    .then(()=>{
        console.log("Connected to Local Database")
    }).then(()=> client.query("select * from newptable"))
    .then((res)=>{
        //console.log(res)
        console.table(res.rows)
        console.log(res.rows)
        outData = res.rows
    }).catch((e)=>{
        console.log(e)
    }).finally(()=>{
        client.end()
    })
    
    res.json(outData)
})

app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))
