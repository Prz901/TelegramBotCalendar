const telebot = require('telebot')
const bot = new telebot('token')
const moment = require('moment')

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
    return bot.sendMessage(msg.from.id, 'nome modificado para : ' + text)
});

bot.on(/^\/addEvent (.+)$/, (msg, props) => {
    const text = props.match[1];
    const eventText = text.split(', ')
    const event = {
        eventIdUser: msg.from.id,
        name: eventText[0],
        date: eventText[1],
        hour: eventText[2]
    }
    addEvent(msg.from.id, event)

});


// deleta os eventos 
bot.on(/^\/deleteEvent (.+)$/, (msg, props) => {
    const text = props.match[1];
    console.log(text)
    deleteEvent(msg.from.id, text)
});

// Le os eventos 
bot.on('/events', (msg) => {
    findUser(msg.from.id).then((resp) => {
        console.log(resp[0].events)
        let response = ''
        resp[0].events.forEach(element => {
            /*
            string com concatenação
            response += element.eventName + '  '+ element.eventTime +`\n`
            string sem precisar de uma concatenação
            */
            response += `Nome do evento: ${element.eventName} Tempo do evento: ${element.eventDate} Hora do Evento: ${element.eventHour} \n`
        });
        return bot.sendMessage(msg.from.id, response)
    })

})
bot.on('/leTodosEventos', (msg) => {
    // funcao que le todos os eventos e avisa sobre todos os eventos cadastrados pelo usuario.
    readEvents().then(resp => {
        resp.forEach(elem =>{
            const auxiliar  = elem.events.filter(element =>{
                return element.eventIdUser == msg.from.id
            })
            auxiliar.forEach(element=>{
                bot.sendMessage(msg.from.id,'Nome do evento: '+element.eventName + ' \n Data do evento: ' + element.eventDate + ' \n Hora do evento: ' + element.eventHour)
            })
            
        })  
    })
})


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
function updateName(id, text) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err
        const dbo = db.db('calendar')
        const query = { id: id }
        dbo.collection('users').updateOne(query, { $set: { 'name': text } }, (err, res) => {
            if (err) throw err
            db.close()
        })
    })
}
function update(id, querry) {
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
function transform(milisecond) {
    console.log(milisecond)
    // um milisegundo = 1000 segundos/ 1 segundo  =  1000 milisegundos / 60 segundos  =  1 minuto / 60 minutos  = 1 hora 
    return milisecond / 1000 / 60 / 60
}
// funcao que adiciona o evento na  array de evento 
function addEvent(id, event) {
    findUser(id)
        .then(() => {
            update({ id: id }, { $push: { events: { $each: [{ eventIdUser: id, eventName: event.name, eventDate: event.date, eventHour: event.hour }] } } })
        })
}
// funcao que deleta eventos 
function deleteEvent(id, eventName) {
    console.log(id)
    console.log(eventName)
    findUser(id)
        .then(() => {
            update({ id: id }, { $pull: { events: { eventName: eventName } } })
        })
}
function readEvents() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) throw err
            const dbo = db.db('calendar')
            dbo.collection('users').find({}).toArray((err, result) => {
                if (err) {
                    reject(err)
                    throw err
                }
                resolve(result)
            })
            db.close()
        })
    })
}
// funçao que pega o dia atual 
function diaAtual() {
    let today = new Date()
    // pega o dia
    let dd = today.getDate()
    // pega o mes
    let mm = today.getMonth() + 1
    // pega o ano
    let yy = today.getFullYear()

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    // conversao a partir do dia/mes/ano -  "datagem brasileira".
    today = dd + '/' + mm + '/' + yy;
    return today
}
function horaAtual() {
    // função que verifica a hora atual   
    let dateHour = new Date()    
    // pega a hora e minutos e coloca numa string
    let currentHour =  ' '+ dateHour.getHours() + ':'+ dateHour.getMinutes()
    
    return currentHour
}
// função que pega a hora atual e verifica os eventos que estao proximos e avisa para o usuario do evento
// verificar o tempo do evento da pessoa com o tempo atual depois verificar quantas horas faltam 
function diferençaHoras(){
    const today = diaAtual()
    let eventsToday = []
    resp.forEach(elem => {
        const aux = elem.events.filter(element => {
            return element.eventDate == today
        })
        eventsToday = eventsToday.concat(aux)
    })
    
    let hora1 = '08:40'
    let hora2 = '10:30'

    let horaInicial =  hora1.split(':')
    let horaFinal =  hora2.split(':')

    horasTotal = parseInt(horaFinal[0],10) - parseInt(horaInicial[0],10)
    minutoTotal = parseInt(horaFinal[1],10) - parseInt(horaInicial[1],10)
    
    if(minutoTotal < 0 ){
        horasTotal -=1
        minutoTotal += 60
    }

    let hora = horasTotal + ':' + minutoTotal
    
    if(hora > '1:50'){
        console.log('passou da hora')
    }

}

// verificar se o evento ja passou (se o evento ja passou destruir o evento)
// avisar com antecedencia o evento do cara e quantas horas faltam
/*
o bot vai avisar o lu que seu evento as 18 horas esta chegando.
*/

/*
função setInverval que recebe 2 argumentos uma função de callback e um integer que representa o tempo em milisegundos.

setInterval(_=>{
    console.log('caralho fe para de me aloprar porra')
}, 5000)
*/





