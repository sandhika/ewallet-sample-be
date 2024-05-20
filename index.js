require('dotenv').config()
const bcrypt = require ("bcrypt")
const express = require('express')
const database = require("./database_connection")
const cors = require("cors")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const SECRET = "ewallet-RAHASIA"

const app = express();

app.use(bodyParser.json())
app.use(cors())


app.post("/login", (request, response, next) => {

    console.log("check username:",request.body.username);
    console.log("check username:",request.body.username);
    database("user")
    .where({username: request.body.username})
    .first()
    .then(user => {
       if(!user){
          response.status(401).json({
             error: "No user by that name"
          })
       }else{
          return bcrypt
          .compare(request.body.password, user.password
            ,function(err, result) { 
                if(result){

                    var token = jwt.sign(user, SECRET);
                    response.status(200).json({token:token})
                    
                }else{
                    response.status(401).json({
                                 error: "Unauthorized Access!"
                    })
                }
            });

       }
    })
 })

 
 function authenticate(request, response, next) {
    const authHeader = request.get("Authorization")
    if(authHeader){
    const token = authHeader.split(" ")[1]
    const secret =  SECRET
    jwt.verify(token, secret, (error, payload) => {
        if(error) throw new Error("sign in error!")
        database("user")
        .where({username: payload.username})
        .first()
        .then(user => {
            request.user = user
            next()
        }).catch(error => {
            response.json({message: error.message})
        })
    })}else{
        response.status(401).json({
            error: "Unauthorized Access!"
        })
    }

}

 app.post("/register", (request, response, next) => {
    // bcrypt.hash(request.body.password, 10)
    console.log(request.body.password);
    bcrypt.hash(request.body.password, 10 , (err, hashedPassword) =>{
        if(err) throw (err)

       return database("user").insert({
          username: request.body.username,
          password : hashedPassword
       })
       .returning(["id", "username"])
       .then(users => {
          response.json(users[0])
       })
       .catch(error => next(error))
    })
 })

app.get("/check-balance",authenticate, (request, response, next) => {
    const userId = request.user.id
    console.log("UserID:",userId)

    database("vwhistory")
        .returning(["create_at", "amount"])
        .where({userid: userId})
        .first()
        .then(data => {
            console.log(data);
            response.json(data)
         })
})


app.post("/transfer",authenticate, (request, response, next) => {
    const userId = request.user.id
    const userIdTo = request.body.to
    const amount = request.body.amount
    console.log("UserID:",userId)
     
    
     return database.raw("call sptransfer(?,?,?)",[userId,userIdTo,amount])
        .then(data => {
            response.status(204).json({message:"Success"})
       })
       .catch(error => 
        
        response.status(
            error.message.includes("Insufficient balance")    
            ?400:error.message.includes("Destination user not found")?404:500).json({
            error: 
            error.message.includes("Insufficient balance")    
            ?"Insufficient balance":error.message.includes("Destination user not found")?"Destination user not found":error.message
        })
    )

  
})

app.post("/top-up",authenticate, (request, response, next) => {
    const userId = request.user.id
    const amount = request.body.amount

    console.log("UserID:",userId)
    console.log("Amount:",amount)

    if(!Number.isInteger(amount))
    {
        response.status(400).json({
            error: "Invalid top up amount"
        })
    }

    return database.raw("call sptopup(?,?)",[userId,amount])
    .then(data => {
        response.status(204).json({message:"Success"})
   })
   .catch(error => next(error))
    
  
})


app.get("/history", authenticate,(request, response, next) => {
    const userId = request.user.id
    database("order")
    .where({fr_userid: userId})
    .then(users => {
       response.json(users)
    })
 })

const port = 5000

app.listen(port, () => console.log(`listening at port ${port}`))