const { Pool }=require("pg");
const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"redbus",
    password:"S@lva#211298",
    port:5432
})

module.exports=pool;