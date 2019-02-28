const telebot = require('telebot')
const bot = new telebot('627868396:AAHl1hwhey06dPxahIHpQedetpm5wrlS7V8')

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'

let user = []

bot.on('/start', (msg) => {

    // colecao de Json 
    // verificar se ja esta no vetor
    if (!aaa(user, msg.from.id)) {
        insertUser({
            id: msg.from.id,
            username: msg.from.username,
            name:msg.from.first_name,
            events: []
        })
        return bot.sendMessage(msg.from.id, 'usuario registrado ')
    }
    return bot.sendMessage(msg.from.id, 'usuario ja registrado')
})


bot.on('/luu', (msg) => {
    console.log(user[0].events[0])
    console.log('\n')
})

bot.on('/hello', (msg) => {
    return bot.sendMessage(msg.from.id, `Hello, ${msg.from.first_name}!`)
})


bot.start();


const aaa = (arr, id) => {
    return arr.find((elem) => {
        if (elem.id === id)
            return elem
    })
}

bot.on(/^\/adicionarEvento (.+)$/, (msg, props) => {
    const text = props.match[1];
    let eventos = text.split(', ')
    
    if(!aaa(user,msg.from.id)){
        return bot.sendMessage(msg.from.id, 'voce ainda nao esta registrado, registre-se usando o /start')
    }
    aaa(user,msg.from.id).events.push({nomeEvento:eventos[0], dia: eventos[1]})
    return bot.sendMessage(msg.from.id, 'event adicionado ')    
});

function insertUser(obj) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err
      var dbo = db.db('calendar')
      dbo.collection('users').insertOne(obj, function (err, res) {
        if (err) throw err
        console.log('player inserted')
        db.close()
      })
    })
  }