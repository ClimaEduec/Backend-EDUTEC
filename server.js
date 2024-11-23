const express = require("express")
const cors = require("cors")
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")
const app = express()
const {DB_HOST,DB_NAME,DB_USER,DB_PASSWORD,SECRET_KEY} = process.env
app.use(cors())
app.use(express.json())

app.post("/register", (request, response)=>{
    const user = request.body.user
    const searchCommand = `SELECT * FROM Users WHERE email = ?`  //ver se existe um usuario com o email

    db.query(searchCommand,[user.email], (error,data)=>{ //devolvendo algo vazio é pq n tem registro desse email
        if(error){
            console.log(error)
            return
        }
        if(data.length !==0) {
            response.json ({ message: "Já existe um usuário cadastrado com esse e-mail. Tente outro e-mail!", userExists: true})
            return
        }

        const insertComand = `INSERT INTO Users (name, email, password) VALUES (?,?,?)`

        db.query(insertComand, [user.name, user.email, user.password], (error) =>{
            if(error){
                console.log(error)
                return
            }

            response.json({ message: "Usuário cadastrado com sucesso!"})
        })
    })
})

app.post("/login", (request, response)=>{
    const user =  request.body.user


    const searchCommand = `SELECT * FROM Users WHERE email = ?`


    db.query(searchCommand, [user.email,], (error, data)=>{
        if(error){
            console.log(error)
            return
        }
        if(data.length === 0){
            response.json({message :"Não existe nenhum usuário cadastrado com esse e-mail!"})
            return
        }
        if(user.password === data[0].password){
            const email = user.email
            const id = data[0].id
            const name = data[0].name
            const token = jwt.sign({id, email, name},SECRET_KEY, {expiresIn: "1h"})
            response.json({token, ok:true })
            return
        }
        response.json({message:"Credenciais inválidas! Tente novamente"})
    })
})

app.get("/verify", (request, response)=>{
    const token = request.headers.authorization

    jwt.verify(token,SECRET_KEY, (error, decoded)=>{
        if(error){
            response.json({message:"Token inválido! Efetue o login novamente."})
            return
        }

        response.json({ok:true})
    })

})

app.get("/getname", (request, response)=>{
    const token = request.headers.authorization
    const decoded = jwt.verify(token, SECRET_KEY)

    response.json({name: decoded.name})
})

app.post("/register", (request, response)=>{
    const user = request.body.user
    const searchCommand = `SELECT * FROM Users WHERE email = ?`  //ver se existe um usuario com o email

    db.query(searchCommand,[user.email], (error,data)=>{ //devolvendo algo vazio é pq n tem registro desse email
        if(error){
            console.log(error)
            return
        }
        if(data.length !==0) {
            response.json ({ message: "Já existe um usuário cadastrado com esse e-mail. Tente outro e-mail!", userExists: true})
            return
        }

        const insertComand = `INSERT INTO Users (name, email, password) VALUES (?,?,?)`

        db.query(insertComand, [user.name, user.email, user.password], (error) =>{
            if(error){
                console.log(error)
                return
            }

            response.json({ message: "Usuário cadastrado com sucesso!"})
        })
    })
})

app.post("/results", (request, response)=>{


    const token = request.headers.authorization
    const decoded = jwt.verify(token, SECRET_KEY)
    //response.json({name: decoded.name})
    const match = request.body.match
    const searchCommand = `SELECT * FROM Game WHERE user_ID = ?`  //ver se existe uma partida esse email
    console.log(decoded.id)
    console.log(match.score)
    console.log(match.time)
    console.log(match.points)

    db.query(searchCommand,[decoded.id], (error,data)=>{
        if (error) {
            // Tratar erro da consulta no banco de dados
            console.log("Erro na consulta:", error);
            return
        }
        else if(data.length === 0){
            const insertCommand = `INSERT INTO Game (user_ID, score, time, points) VALUES (?,?,?,?)`//devolvendo algo vazio é pq n tem registro desse email
            console.log("não deu erro, tentando cadastrando")
            db.query(insertCommand, [decoded.id, match.score, match.time, match.points], (error) =>{
                if(error){
                    console.log("erro logo abaixo:") // aqui
                    console.log(error)
                    return
                }
                response.json({ message: "Usuário cadastrado com sucesso!"})
                console.log("Usuário cadastrado com sucesso!",data)
                return
            })
        }
        else{
            if(match.points>data.points){
                const updateCommand = `UPDATE Game SET score = ?, time = ?, points = ? WHERE user_ID = ?` // arruamr
                console.log("pontuação da partida é maior doq a salva")
                db.query(updateCommand, [match.score, match.time, match.points, decoded.id], (error) =>{
                    if(error){
                        console.log("erro logo abaixo:") // aqui
                        console.log(error)
                        return
                    }
                    response.json({ message: "Usuário atualizado com sucesso!"})
                    console.log("Usuário obteve mais pontos com sucesso!",data)
                    return
                })
            }
            else{
                console.log("os pontos foram menores do que os que estão guardados")
            }
            response.json({ message: "Ja existe alguem com esse email jogado"})
            return
        }
    })
})



app.get('/rank', (req, res) => {
    console.log("aq")
    const query = `
        SELECT
            u.name AS userName,
            g.points,
            g.time,
            g.score
        FROM
            Game g
        INNER JOIN
            Users u
        ON
            g.user_ID = u.id
        ORDER BY
            g.points DESC,
            g.time ASC
        LIMIT 6;
    `;
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar ranking:', error);
            res.status(500).json({ error: 'Erro ao buscar ranking' });
            return;
        }
        res.status(200).json(results);
        console.log(results)
    });
});














app.listen(3000 , () => {
    console.log("server funcionando 3000 carai")
})

const db = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
})

