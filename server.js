const express = require('express')
const app = express()
const cors = require('cors')
const database = require('./utils/database.js')
const fs = require('fs')

app.use(express.json())
app.use(cors())

app.get('/api/login', async (req,res)=>{
    const result = await database.logIn(req.query.username,req.query.password).catch(err=>err)
    res.write(JSON.stringify(result))
    res.end()
})

app.post('/api/signUp', async (req,res)=>{
    const result = await database.signUp(req.body.username,req.body.password,req.body.number).catch(err=>err)
    res.write(JSON.stringify(result))
    res.end()
})

app.get('/api/getFish', async (req,res)=>{
    const result = await database.getFish(req.query.type,req.query.lowest,req.query.highest)
    res.write(JSON.stringify({fish:result}))
    res.end()
})

app.post('/api/updateCart', (req,res)=>{
    database.updateCart(req.body.username,req.body.cart)
    res.end()
})

app.post('/api/uploadHistory',(req,res)=>{
    database.uploadHistory(req.body.username,req.body.items,req.body.total,req.body.deliver_date,req.body.purchase_date,req.body.address)
    res.end()
})

app.get('/api/retrieveHistory', async (req,res)=>{
    const result = await database.retrieveHistory(req.query.username)
    res.write(JSON.stringify(result))
    res.end()
})

app.post('/api/uploadComment', (req,res)=>{
    database.uploadComment(req.body.username,req.body.comment,req.body.date)
    if (req.body.image) fs.writeFileSync(`./img/${req.body.date}.txt`, req.body.image)
    res.end()
})

app.get('/api/getComments', async(req,res)=>{
    let result = await database.getComments()
    result = result.map(i=>{
        try{
            i.image = fs.readFileSync(`./img/${i.date}.txt`).toString()
            return i
        } catch {
            i.image = null
            return i
        }
    })
    res.write(JSON.stringify(result))
    res.end()
})



app.listen(4000)