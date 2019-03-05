// arquivo criado como fonte de estudos para promises e metodos lambdas.

let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
    }, 2000);
    resolve('a promise 1 foi resolvida')
})

let promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('a promise 2 foi resolvida')
    }, 2000);
})
/*
promise2.then((resultado)=>{
    console.log(resultado)
}).catch((error)=>{
    console.log(error)
})
*/

// A promise é uma implementação de callback mais obvia.

arr = ["Felipe", "Luis", "Davi", "Mauricio", "Branco"]

arr.forEach((element, index) => {
    console.log(element, index)
})

console.log("---------------------------------")

const x = arr.map(element => {
    return element + " Bica :" + element.length
})
console.log(x)

console.log("----------------------------------")
arr1 = [1, 5, 7, 9, 15]

const multiply = arr1.map((elem) => {
    return (2 * elem)
})

console.log("multiply é : " + multiply)

console.log("---------------------------")

// filter elem > 10 
let array = arr1.filter((elem) => {
    return elem >= 10
})
console.log(array)

const alunos = [{
    name: 'luis',
    idade: 23,
    universidade: 'mackenzie'
},
    {
        name: 'branco',
        idade: 23,
        universidade: 'mackenzie'
    },
    {
        name: 'fê',
        idade: 23,
        universidade: 'mackenzie'
    },
    {
        name: 'bica',
        idade: 19,
        universidade: 'puc'

    }]

console.log("---------------------------------------------------")

const idades = alunos.map( elem  => {
    return elem.idade
})
idades.forEach(elem => {
    console.log(elem)
})

let arrayAlunos = alunos.filter(elem =>{
    return elem.idade > 20
})
console.log("-------------------------------------------")

arrayAlunos.forEach(elem =>{
    console.log(elem)
})

// estudar reduce e sort para arrays estaticos e arrays com json
//reduce
//sort