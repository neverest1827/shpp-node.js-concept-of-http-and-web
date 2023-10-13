const express = require('express')
const app = express()
const port = 3000

app.locals.url1Counter = 0;
app.locals.url2Counter = 0;

app.get('/', (req, res) => {
  res.send(`
  <p>Url1 has been open ${app.locals.url1Counter}</p>
  <p>Url2 has been open ${app.locals.url2Counter}</p>`
  )
})

app.get('/url1', (req, res) => {
  let count = app.locals.url1Counter
  let color = count < 5 ? 'green' : (count < 10 ? 'yellow' : 'red')
  res.send(`
    <style scoped>
      body{background-color: #ede6e6} 
      div {
        margin-top: 50px; 
        font-size: 18; 
        display: flex; 
        justify-content: center; 
        align-items: center} 
      span{
        color: ${color}; 
        font-size: ${18 + count}; 
        padding-left: 5px; 
        padding-right: 5px} 
    </style>
    <div>This site has been open <span>${app.locals.url1Counter++}</span> times<div>`
  )
})

app.get('/url2', (req, res) => {
  let count = app.locals.url2Counter
  let color = count < 5 ? 'green' : (count < 10 ? 'yellow' : 'red')
  res.send(`
    <style scoped>
      body{background-color: #ede6e6} 
      div {
        margin-top: 50px; 
        font-size: 18; 
        display: flex; 
        justify-content: center; 
        align-items: center} 
      span{
        color: ${color}; 
        font-size: ${18 + count}; 
        padding-left: 5px; 
        padding-right: 5px} 
    </style>
    <div>This site has been open <span>${app.locals.url2Counter++}</span> times<div>`
  )
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
