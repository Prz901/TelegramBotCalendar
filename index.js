const telebot = require('telebot')
const bot = new telebot('token')
const moment  =  require('moment')

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
    return bot.sendMessage(msg.from.id, 'nome modificado para : ' + text )
});

bot.on(/^\/creatEvent (.+)$/, (msg, props) => {
    const text = props.match[1];
    const eventText = text.split(', ')
    const event = {
        eventName: eventText[0],
        eventTime: eventText[1]
    }
    //Date.now()
    const time = transform(1000000)
    console.log(time)
    console.log(event)
    const date  = moment()
    console.log(date)
    addEvent(msg.from.id, {name : eventText[0], time: eventText[1]})

});
// deleta os eventos 
bot.on(/^\/deleteEvent (.+)$/, (msg, props) => {
    const text = props.match[1];
    console.log(text)
    deleteEvent(msg.from.id, text)
});

// Le os eventos 
bot.on('/events', (msg) => {
    findUser(msg.from.id).then((resp)=>{
        console.log(resp[0].events)
        let  response = ''
        resp[0].events.forEach(element => {
            /*
            string com concatenação
            response += element.eventName + '  '+ element.eventTime +`\n`
            string sem precisar de uma concatenação
            */
            response += `Nome do evento: ${element.eventName} Tempo do evento: ${element.eventTime} \n` 
        });
        return bot.sendMessage(msg.from.id, response )
    })

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
function update(id, querry){
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err
        const dbo = db.db('calendar')
        dbo.collection('users').updateOne(id, querry, (err, res) => {
          if (err) throw err
          db.close()
        })
      })
}
// funcao que transforma o tempo 
function transform (milisecond){
    console.log(milisecond)
    // um milisegundo = 1000 segundos/ 1 segundo  =  1000 milisegundos / 60 segundos  =  1 minuto / 60 minutos  = 1 hora 
    return milisecond/1000/60/60
}
// funcao que adiciona o evento na  array de evento 
function addEvent(id, event){
    findUser(id)
    .then(() => {
      update({ id: id }, { $push: { events: { $each: [{ eventName: event.name , eventTime : event.time }] } } })
    })
}
// funcao que deleta eventos 
function deleteEvent(id, eventName){
    console.log(id)
    console.log(eventName)
    findUser(id)
      .then(() => {
        update({ id: id }, { $pull: { events: { eventName: eventName } } })
      })
}






