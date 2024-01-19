const mysql = require('mysql')
const con = mysql.createPool({connectionLimit:40,host:"sql5.freemysqlhosting.net",user:"sql5678167",password:"34CA5F8iiW", database: "sql5678167",debug: false})

function getFish(type='',lowest='0',highest='100'){
    const range = ` WHERE price > ${lowest} AND price < ${highest}`
    let where
    switch(type.toUpperCase()){
        case "FRESHWATER":
            where = " AND type = 'freshwater'"
            break;
        case "SALTWATER":
            where = " AND type = 'saltwater'"
            break;
        case "EXOTIC":
            where = " AND type = 'exotic'"
            break;
        default:
            where = ''
    }
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if (err) throw err
            let sql = `SELECT * FROM fish${range}${where}`
            connection.query(sql, (err,result)=>{
                if (err) throw err
                resolve(result)
            })
            connection.release()
        })
    })
}

function signUp(username, password, number){
    return new Promise((resolve,reject)=>{
        con.getConnection( (err,connection) =>{
            if (err) throw err
            // select query to check if username already exists in database
            let sql = `SELECT username FROM accounts WHERE username = "${username}"`
            connection.query(sql, (err, result)=>{
                if (err) throw err
                if (result.length) reject({error: "Username already taken"})
                else {
                    // if it doesnt exist it enters user and password into database
                    sql = `INSERT INTO accounts (username, password, number) VALUES ("${username}","${password}","${number}")`
                    connection.query(sql, (err,result)=>{
                        if (err) throw err;
                        resolve({result: 'Success'})
                    })
                    sql = `INSERT INTO cart (cart,username) VALUES ("[]","${username}")`
                    connection.query(sql, (err,result)=>{
                        if(err) throw err
                    })
                }
            })
            connection.release()
        })
    })
}

function logIn(username,password){
    return new Promise((resolve,reject)=>{
        con.getConnection( (err,connection) =>{
            if (err) throw err
            // select query to see if user and password match
            let sql = `
            SELECT username, password, picture
            FROM accounts
            WHERE username = '${username}' AND password = '${password}'`
            connection.query(sql, async (err, result)=>{
                if (err) throw err
                // if none show up one of them is invalid and error is returned
                if (!result.length) reject({error: "Invalid username/password"})
                else {
                    const cart = await retrieveCart(username)
                    resolve({result, cart})
                }
            })
            connection.release()
        })
    })
}

function retrieveCart(username){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            let sql = `
            SELECT c.cart 
            FROM cart c 
            LEFT JOIN accounts a ON a.username = c.username
            WHERE a.username = "${username}"`
            connection.query(sql,(err,result)=>{
                if (err) throw err
                resolve(result[0])
            })
            connection.release()
        })
    })
}

function updateCart(username,cart){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            let sql = `
            UPDATE Cart
            SET cart = '${cart}'
            WHERE username = "${username}"
            `
            connection.query(sql, (err,result)=>{
                if (err) throw err
            })
            connection.release()
        })
    })
}

function uploadHistory(username,items,total,deliver_date,purchase_date,address){
    con.getConnection((err,connection)=>{
        if (err) throw err
        const sql = `
        INSERT INTO purchase_history (username,items,total,deliver_date,purchase_date,address)
        VALUES ("${username}",'${items}',"${total}","${deliver_date}","${purchase_date}", "${address}")
        `
        connection.query(sql, (err,result)=>{
            if (err) throw err
        })
        connection.release()
    })
}

function retrieveHistory(username){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if (err) throw err;
            const sql = `
            SELECT *
            FROM purchase_history
            WHERE username = "${username}"
            `
            connection.query(sql,(err,result)=>{
                if (err) throw err
                resolve(result)
            })
            connection.release()
        })
    })
}

function uploadComment(username, comment,date){
    con.getConnection((err,connection)=>{
        if (err) throw err;
        const sql = `INSERT INTO comments (username,comment,date)
        VALUES ("${username}", "${comment}", "${date}")`
        connection.query(sql,(err,result)=>{
            if (err) throw err
        })
        connection.release()
    })
}

function getComments(){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if (err) throw err
            const sql = `SELECT * FROM comments`
            connection.query(sql,(err,result)=>{
                if (err) throw err
                resolve(result)
            })
            connection.release()
        })
    })
}

module.exports = {
    getFish,
    signUp,
    logIn,
    retrieveCart,
    updateCart,
    uploadHistory,
    retrieveHistory,
    uploadComment,
    getComments,
}