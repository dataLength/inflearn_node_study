//백엔드의 시작점
const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dam:qweasdzxc@cluster0-hzpac.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(()=>console.log('MongoDB Connected...'))
  .catch((err)=>console.log(err));


app.get('/',(req,res) => res.send('Hello world'));
app.listen(port,() => console.log(`example app listeninf on port ${port}!`));