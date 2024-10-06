const express = require("express");
const multer= require("multer");
const fs= require("fs");
const csvParser = require("csv-parser");
const pool= require("./dbconnection");
const cors = require('cors');
const bodyParser = require("body-parser");


const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
const upload =multer({ dest: "data/" });
const busupload =multer({ dest: "bus/" });
app.post("/busdetails", upload.single("csv"), async (req, res)=>{
    const filepath=req.file.path;
try{
 const client =await pool.connect();
 const result = [];
 fs.createReadStream(filepath)
 .pipe(csvParser())
 .on("data", row => {
    result.push(row);
 })
 .on("end", async () => {
    const query = 'INSERT INTO "busdetails" ("BusName", "From", "To", "Description", "Date", "Departure", "DepartureTime", "Arrival", "ArrivalTime", "Duration", "Chair", "Breath", "Chairfare", "SleeperFare", "WaterBottle", "ACSleeper", "FreeWifi", "ChargingStation", "WashRoom", "Photo", "rating", "Stop1", "TimingStop1", "Stop2", "TimingStop2", "Boarding", "Dropping") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,  $22,  $23, $24, $25, $26, $27)';
    await Promise.all(
        result.map(async row => {
        const { BusName, From, To, Description, Date, Departure, DepartureTime, Arrival,ArrivalTime, Duration, Chair, Breath, Chairfare, SleeperFare, WaterBottle, ACSleeper, FreeWifi, ChargingStation, WashRoom, Photo, rating, Stop1, TimingStop1, Stop2, TimingStop2, Boarding, Dropping} = row;
        const value = [BusName, From, To, Description, Date, Departure, DepartureTime, Arrival,ArrivalTime, Duration, Chair, Breath, Chairfare, SleeperFare, WaterBottle, ACSleeper, FreeWifi, ChargingStation, WashRoom, Photo, rating, Stop1, TimingStop1, Stop2, TimingStop2, Boarding, Dropping];
        await client.query(query, value);
        })
    );
    client.release();
    console.log("upload sucessfully");
 });

}
catch(error)
{
    console.error("my error",error);
   
}

});
app.post("/seatArrangement", busupload.single("csv"), async (req, res)=>{
    const filepath=req.file.path;
try{
 const client =await pool.connect();
 const result = [];
 fs.createReadStream(filepath)
 .pipe(csvParser())
 .on("data", row => {
    result.push(row);
 })
 .on("end", async () => {
    console.log("inside");
    const query = 'INSERT INTO "busseat" ("busname", "From", "To", "DepartureTime", "ArrivalTime", "lowerseat", "upperseat", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,  $22,  $23, $24)';
    await Promise.all(
        result.map(async row => {
        const { busname, From, To, DepartureTime,ArrivalTime, lowerseat, upperseat, S1, S2, S3, S4, S5, S6, S7, S8, U1, U2, U3, U4, U5, U6, U7, U8, U9} = row;
        const value = [busname, From, To, DepartureTime,ArrivalTime, lowerseat, upperseat, S1, S2, S3, S4, S5, S6, S7, S8, U1, U2, U3, U4, U5, U6, U7, U8, U9];
        await client.query(query, value);
        console.log("upload",value);
        })
    );
    client.release();
    console.log("upload sucessfully");
 });

}
catch(error)
{
    console.error("my error",error);
   
}

});
app.get("/bookseat/:busname", async (req, res) => {
    const { busname } = req.params;
    console.log(busname,"busname");
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = `SELECT * FROM "Bookbus" WHERE busname LIKE '%${busname}%'`;
        const result = await client.query(query);
        res.send(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/seat/:busname", async (req, res) => {
    const { busname } = req.params;
    console.log(busname, "dddd");
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = `SELECT * FROM "busseat" WHERE busname LIKE '%${busname}%'`;
        const result = await client.query(query);
        res.send(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/busdetails/:From/:To/:Date", async (req, res) => {
    const { From,To,Date } = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        const extDate = "ALL";
        const query = `SELECT * FROM busdetails WHERE "From" = $1 AND "To" = $2 AND ("Date" = $3 OR "Date" = $4) `;
        const values = [From,To,Date,extDate];
        console.log(values,"values");
        const result = await client.query(query, values);
        res.send(result.rows);
        console.log(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/login/:email/:pass", async (req, res) => {
    const { email,pass} = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = `SELECT * FROM usertable WHERE "email" = $1 AND "pass" = $2`;
        const values = [email,pass];
        const result = await client.query(query, values);
        res.send(result.rows);
        console.log(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = 'SELECT * FROM usertable WHERE "email" = $1';
      
        const result = await client.query(query, [email]);
        res.send(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/busfilter/:Description/:From/:To", async (req, res) => {
    const { Description,From, To} = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = 'SELECT * FROM busdetails WHERE "Description" =$1 AND "From" =$2 AND "To" =$3';
              const values = [Description,From,To];
        const result = await client.query(query,values);
        res.send(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/busAcfilter/:ACSleeper/:From/:To", async (req, res) => {
    const { ACSleeper,From, To} = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        if(ACSleeper === 'Yes')
        {
        const query = 'SELECT * FROM busdetails WHERE "ACSleeper" =$1 AND "From" =$2 AND "To" =$3';
              const values = [ACSleeper,From,To];
        const result = await client.query(query,values);
        res.send(result.rows);
    }
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/busNonAcfilter/:ACSleeper/:From/:To", async (req, res) => {
    const { ACSleeper,From, To} = req.params;
    const client = await pool.connect(); // Connect to the database
  
    try {
        if(ACSleeper === 'NO')
        {
        const query = 'SELECT * FROM busdetails WHERE "ACSleeper" =$1 AND "From" =$2 AND "To" =$3';
              const values = [ACSleeper,From,To];
        const result = await client.query(query,values);
        res.send(result.rows);
    }
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
});
app.get("/user/phone/:phone", async (req, res) => {
    const { phone } = req.params;
    console.log(phone,"Phone");
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = 'SELECT * FROM usertable WHERE "phone" = $1';
        const result = await client.query(query, [phone]);
        // console.log(result,"eeee")
        res.send(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
})
app.get("/busdetails/:BusName", async (req, res) => {
    const { BusName } = req.params;
    const busName = BusName.trim().substring(1); // Trim whitespace
    const client = await pool.connect(); // Connect to the database
  
    try {
        const query = 'SELECT * FROM busdetails WHERE "BusName" = $1';
      
        const result = await client.query(query, [busName]);
        res.send(result.rows);
        console.log(result);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Release the client back to the pool
    }
})
app.post("/user", async(req,res) =>
{
    // console.log(req);
    const {firstname, lastname, email, phone, pass, retypepass, dob, gender, gstno, bussinessname, role, userage, otp} =req.body;
    console.log(req.body);
    try{
        const client =await pool.connect();
        // let insertQuery = `insert into myuser(firstname,lastnam,email,phone,pass,retypepas,dob,gender, gstno, bussinessname, role, userage, otp) values('${}','${myuser.name}','${myuser.email}','${myuser.address}','${myuser.password}','${myuser.retypepassword}')`

        const query='INSERT INTO usertable("firstname", "lastname", "email", "phone", "pass", "retypepass", "dob", "gender", "gstno", "bussinessname", "role", "userage", "otp") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
        const values=[firstname, lastname, email, phone, pass, retypepass, dob, gender, gstno, bussinessname, role, userage, otp];
        const result = await client.query(query,values);
        console.log("value",values);
        res.send(result.rows); 
        console.log("upload sucessfully");
        client.release();
       }
       catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } 
});

app.post("/bookDetails", async(req,res) =>
{
    console.log(req,"ssss");
    const {name, email, phone, seatno, busname, fare, from, To, Desc, DeptDate, ArrTime,gender,payment} =req.body;
    console.log(req.body);
    try{
        const client =await pool.connect();
        // let insertQuery = `insert into myuser(firstname,lastnam,email,phone,pass,retypepas,dob,gender, gstno, bussinessname, role, userage, otp) values('${}','${myuser.name}','${myuser.email}','${myuser.address}','${myuser.password}','${myuser.retypepassword}')`

        const query='INSERT INTO "Bookbus"("name", "email", "phone", "seatno","busname", "fare", "from", "To", "Desc", "DeptDate", "ArrTime","gender","payment") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
        const values=[name, email, phone, seatno, busname, fare, from, To, Desc, DeptDate, ArrTime,gender,payment];
        const result = await client.query(query,values);
        console.log("value",values);
        res.send(result.rows); 
        console.log("upload sucessfully");
        client.release();
       }
       catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } 
});
app.listen(2000, ()=>
{
    console.log("my port run");
});