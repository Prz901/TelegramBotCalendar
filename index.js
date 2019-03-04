const telebot = require('telebot')
const bot = new telebot('token')

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'

let user = []
//creat user to db 
bot.on('/start', (msg) => {
    // verificar se ja esta no banco
    findUser(msg.from.id).then((resolve) => {
        console.log(resolve)
        if (resolve.length > 0) {
            return bot.sendMessage(msg.from.id, 'usuario ja registrado')
        }
        insertUser({
            id: msg.from.id,
            username: msg.from.username,
            name: msg.from.first_name,
            events: []
        })
        return bot.sendMessage(msg.from.id, 'usuario registrado ')

    }).catch((reject) => {
        console.log(reject)
    })

})

bot.on('/luu', (msg) => {
    console.log(user[0].events[0])
    console.log('\n')
})

bot.on('/hello', (msg) => {
    return bot.sendMessage(msg.from.id, `Hello, ${msg.from.first_name}!`)
})


bot.on('/delete', (msg) => {
    deleteUser({
        id: msg.from.id,
    })
})

bot.start();

bot.on(/^\/adicionarEvento (.+)$/, (msg, props) => {
    const text = props.match[1];
    let eventos = text.split(', ')

    if (!aaa(user, msg.from.id)) {
        return bot.sendMessage(msg.from.id, 'voce ainda nao esta registrado, registre-se usando o /start')
    }
    aaa(user, msg.from.id).events.push({ nomeEvento: eventos[0], dia: eventos[1] })
    return bot.sendMessage(msg.from.id, 'event adicionado ')
});
bot.on(/^\/changeName (.+)$/, (msg, props) => {
    const text = props.match[1];
    console.log(text)
    updateName(msg.from.id, text)
    return bot.sendMessage(msg.from.id, 'nome modificado')
});

// cria o usuario no banco 
function insertUser(obj) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err
        const dbo = db.db('calendar')
        dbo.collection('users').insertOne(obj, function (err, res) {
            if (err) throw err
            console.log('player inserted')
            db.close()
        })
    })
}
// deleta o usuario do banco
function deleteUser(obj) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err
        const dbo = db.db('calendar')
        dbo.collection('users').deleteOne(obj, function (err, res) {
            if (err) throw err
            console.log('deleted')
            db.close()
        })
    })
}
// le o usuario no banco
function findUser(id) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) throw err
            const dbo = db.db('calendar')
            const query = { id: id }
            dbo.collection('users').find(query).toArray((err, result) => {
                if (err) throw err
                resolve(result)
                db.close()
            })
        })
    })
}


function searchName(id){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) throw err
            const dbo = db.db('calendar')
            const query = { id: id }
            dbo.collection('users').find(query).toArray((err, result) => {
                if (err) throw err
                resolve(result)
                db.close()
            })
        })
    })
}

// update
function updateName(id, text){
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err
        const dbo = db.db('calendar')
        const query  = {id: id}
        dbo.collection('users').updateOne(query, {$set:{'name':text}}, (err, res) => {
          if (err) throw err
          db.close()
        })
    })
}
