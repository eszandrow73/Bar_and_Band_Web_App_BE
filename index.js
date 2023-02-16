//const Client = require('pg').Client
const {Client} = require('pg')

const PORT = 8999
//import Express from 'express'
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer');
var nodemailer = require('nodemailer');

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const MailMessage = require('nodemailer/lib/mailer/mail-message');
const { DefaultTransporter } = require('google-auth-library');


app = express()
app.use(cors());
/*
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); */
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


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
    database: "postgres"//"barMusicApp"//
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

/*------------------------------------------
--------------------------------------------
image upload code using multer\


D:/Programming/NodeJS/GitHub_repos/Bar_and_Band_Web_App_BE/images/
--------------------------------------------
--------------------------------------------*/
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        console.log(file.originalname);
        cb(null, Date.now() + '-' + file.originalname);
    }
 });
 
 const maxSize = 2 * 1024 * 1024;
 var upload = multer({ storage: storage,
    //limits: { fileSize: maxSize }, 
});


app.get('/', async(req , res ) => {
    //res.html(html_example)
    html_test = "<html><h1>Bar and Band API for Postgres Database</h1></html>"
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(html_test));
})

app.get('/i_test/:inputPage', async(req,res)=>{
    raw_html = `
    <!DOCTYPE html>
    <html lang="eng">

    <body>
        <h1>Upload Image : ${req.params.inputPage}</h1>
        <form method="POST" action="http://localhost:8999/api/image-upload/${req.params.inputPage}" enctype="multipart/form-data">
            <input type="file" name="image" onChange="function loadImage(event){
                console.log(event)
                console.log(event.target.files[0]);
                var selectedImage = event.target.files[0];
                var elem = document.createElement('img');
                elem.src = window.URL.createObjectURL(selectedImage);
                document.getElementById('body').appendChild(elem);
            }
            loadImage(event);">
            <div id='body'></div>
            <input type="submit">
        </form>
    </body>
    </html>
    `
    res.set('Content-type', 'text/html')
    res.send(Buffer.from(raw_html))
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

app.post('/api/image-upload/:ptype', upload.single('image'), async(req, res) => {
    const image = req.file;
    console.log(image)
    console.log(req.file.filename)
    console.log("EZ DEBUG")
    if(req.params.ptype=="Profile"){
        //barClient.query(`INSERT INTO public.testimages (imagename) VALUES('');`)
        barClient.query(`UPDATE public.profiledata    SET profileimage='${req.file.filename}' where user_id=1;`)
        .then((dbRes)=>{
            //console.table(dbRes.rows)
            //console.log(dbRes.rows)
            outData = dbRes.rows
            res.send({message: 'File uploaded successfully.', image});
        }).catch((e)=>{
            console.log(e)
            res.json(e)
        })
    }
    if(req.params.ptype=="MainPost"){
        let db_res = await barClient.query('select Max("postId") from public."postTable";')
        console.log(db_res.rows[0].max.toString())
        barClient.query(`UPDATE public."postTable" SET img_id='${req.file.filename}' where "postId" = ` + db_res.rows[0].max.toString())
        .then((dbRes)=>{
            //console.table(dbRes.rows)
            //console.log(dbRes.rows)
            outData = dbRes.rows
            res.send({message: 'File uploaded successfully.', image});
        }).catch((e)=>{
            console.log(e)
            res.json(e)
        })
    }    
  });

app.get('/addBand', async(req, res)=>{
    
    var inputList = req.query

    var addToDB = ""
    addToDB = " VALUES('" + inputList.input[0] + "', '"
    addToDB = addToDB + inputList.input[1] + "', '"
    addToDB = addToDB + inputList.input[2] + "', '"
    addToDB = addToDB + inputList.input[3] + "');"

    console.log(addToDB)

    var outData = {}
   barClient.query('INSERT INTO public.banddata (spotify, website, "style", members)'+ addToDB)
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
    })
    /*
    .finally(async ()=>{
        res.json(outData)
    })
    */

})

app.get('/addPost', async(req, res)=>{
    
    var inputList = req.query

    var addToDB = ""
    addToDB = " VALUES(" + inputList.input[0] + ", '"
    addToDB = addToDB + inputList.input[1] + "', '"
    addToDB = addToDB + inputList.input[2] + "', "
    addToDB = addToDB +  "null);"

    console.log(addToDB)

    var outData = {}
   barClient.query('INSERT INTO public."postTable"(user_id, "postText", "location", img_id)'+ addToDB)
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows)
        console.log(dbRes.rows)
        outData = dbRes.rows
    }).catch((e)=>{
        console.log(e)
        res.json(e)
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

app.get('/artData', async(req, res)=>{
    
    var outData = {}

    
   barClient.query('select artwork, artist_name, sponsor, user_id, band_id, id from public."artistTable"')
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows)
        console.log(dbRes.rows)
        outData = dbRes.rows
        res.json(outData)
        
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    })
})

app.get('/getImages', async(req,res)=>{
    var outData = {}

    barClient.query('select * from public.testimages') 
   //barClient.query('select * from public."postTable"')
   //barClient.query(`SELECT ENCODE("postImage",'base64') as base64,"postText" from public."postTable";`)
    .then((dbRes)=>{
        //console.table(dbRes.rows)
        //console.log(dbRes.rows)
        outData = dbRes.rows
        res.json(outData)
        
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    })
})

app.get('/getPosts', async(req,res)=>{
    var outData = {}
    
    barClient.query('select "postText", "location", "postId", user_id, img_id from public."postTable"')
   //barClient.query(`SELECT ENCODE("postImage",'base64') as base64,"postText" from public."postTable";`)
    .then((dbRes)=>{
        //console.table(dbRes.rows)
        //console.log(dbRes.rows)
        outData = dbRes.rows
        res.json(outData)
        
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    })
})

app.get('/getProfile', async(req,res)=>{
    var outData = {}
    
    barClient.query('select * from public.profiledata')
    .then((dbRes)=>{
        outData = dbRes.rows
        res.json(outData)
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    })
})

app.get('/updateProfile', async(req,res)=>{
    var inputList = req.query
    console.log(inputList)
    var outData = {}
    var uId = parseInt(req.query.userId)
    
    barClient.query(`UPDATE public.profiledata SET profiletext='${req.query.profileEditText}' where user_id=${uId};`)
    .then((dbRes)=>{
        outData = dbRes.rows
        res.json(outData)
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    })
})

app.get('/sendEmail', async(req, res)=>{
    var nodemailer = require('nodemailer');

    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "0ebdd5fb17a376",
          pass: "3caedef039849c"
        }
      });

    var inputList = req.query
    console.log(inputList)

    var mailOptions = {
        from: inputList.input[0],//'ericzan73964@gmail.com',
        to: inputList.input[1],//'ericzan73@aol.com',
        subject: inputList.input[2],//'test email from api route',
        text: inputList.input[3]//'That was easy!'
    };

    transport.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log(info);
            res.json({'email status': 'sent'})
        }
    });
})

app.get("/image/:test", async(req,res)=>{
    //let img_path = "./images/test.png"
    console.log(req.params.test)
    let img_path = `D:/Programming/NodeJS/GitHub_repos/Bar_and_Band_Web_App_BE/images/${req.params.test}`//`C:/Users/Owner/Documents/API/DB_connect/Bar_and_Band_Web_App_BE`  //`
    
    res.sendFile(img_path)
})

app.get("/getUser/:userName", async(req,res)=>{
    console.log(req.params)
    
    barClient.query('SELECT username, account_id FROM public.user_info '+ `WHERE username = '${req.params.userName}'`)
    //username = '${req.params.userName}'`)
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows) 
        console.log(dbRes.rows)
        outData = dbRes.rows
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).then(async()=>{
        res.json(outData)
    })
})

app.get("/checkUser/:userId", async(req,res)=>{
    console.log(req.params)
    
    barClient.query('SELECT username, "password", email FROM public.user_info '+ `WHERE account_id = ${req.params.userId}`)
    //username = '${req.params.userName}'`)
    .then((dbRes)=>{
        //console.log(res)
        console.table(dbRes.rows) 
        console.log(dbRes.rows)
        outData = dbRes.rows
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).then(async()=>{
        res.json(outData)
    })
})

app.get("/band/:bandnum/member/:mnum", async(req, res)=>{
    //console.log(req.params.bandnum)
    //console.log(req.params.mnum)
    barClient.query(`SELECT * FROM public."bandMembers" where ("bandID"=${req.params.bandnum} AND "memberID"=${req.params.mnum})`)
    .then((dbRes)=>{
        //console.log(res)
        //console.table(dbRes.rows) 
        //console.log(dbRes.rows)
        outData = dbRes.rows
    }).catch((e)=>{
        console.log(e)
        res.json(e)
    }).then(async()=>{
        res.json(outData)
    })
})


// If modifying these scopes, delete token.json.
//for more scopes : https://developers.google.com/gmail/api/auth/scopes

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];//'https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data //.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  console.log(labels)
  /*labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
  */
}

app.get('/sendEmailReal', async(req, res)=>{
    //authorize email before sending message
    authorize().then(async(auth)=>{
//async function gmailFun(auth) {
        const gmail = google.gmail({version: 'v1', auth});
        
        /*
        const subject = '🤘 Hello 🤘';
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        var messageParts = [
            'From: Eric Zandrow <ericzan73964@gmail.com>',
            'To: Eric Zandrow <ericzan73964@gmail.com>',
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            'This is a message just to say hello.',
            'So... <b>Hello!</b>  🤘❤️😎',
        ];
        */
       var inputList = req.query
        console.log(inputList)

        /*var mailOptions = {
            from: inputList.input[0],//'ericzan73964@gmail.com',
            to: inputList.input[1],//'ericzan73@aol.com',
            subject: inputList.input[2],//'test email from api route',
            text: inputList.input[3]//'That was easy!'
        }; */
        messageParts = [
            `From: ${inputList.input[0]}`,//'ericzan73964@gmail.com',
            `To: ${inputList.input[1]}`,//'ericzan73@aol.com',
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${inputList.input[2]}`,//'test email from api route',
            '',
            `${inputList.input[3]}`//'That was easy!'
        ]
        const message = messageParts.join('\n');

        // The body needs to be base64url encoded.
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const resM = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
            raw: encodedMessage,
            },
        });
        console.log(resM.data);
        return res.json(resM.data.threadId);
    })
    .catch((err)=>{
        console.log.err
        return res.json(err)}
    );
})


app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))
