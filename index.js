//백엔드의 시작점
const express = require('express');
const app = express();
const port = 5000;
const {User} = require('./models/User');
const {auth} = require('./middleware/auth');
const bodyParser = require('body-parser');

const config = require('./config/key');
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true})); 
//apllication/json
app.use(bodyParser.json());

app.use(cookieParser());

//mongoDB connect
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(()=>console.log('MongoDB Connected...'))
  .catch((err)=>console.log(err));

//route
app.get('/',(req,res) => res.send('Hello world!'));

app.post('/api/users/register',(req,res) => {
    //회원 가입 할때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);

    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err});
        return res.status(200).json({
            success:true
        });
    });
});

app.post('/api/users/login',(req,res)=>{
    //요청된 이메일을 데이터베이스에서 있는지 찾음
    User.findOne({email:req.body.email},(err,user)=>{
        if(!user){
            return res.json({
                loginSuccess:false,
                Message : "fail"
            });
        }else{
            user.comparePassword(req.body.password,(err,isMatch)=>{
                if (!isMatch){
                    return res.json({loginSuccess:false, message:"비번X"});
                }else{
                    //토큰 생성
                    user.generateToken((err,user)=>{
                        if(err) return res.status(400).send(err);
    
                        //토큰을 저장한다. 어디? cookie, local storage
                        res.cookie("x_auth",user.token)
                        .status(200)
                        .json({loginSuccess:true,userId: user._id});
    
                    });
                }
            });
        }
    });
    //비밀번호가 같은지 확인
});

// 0 일반유저
// !0 관리자
app.get('/api/users/auth', auth, (req,res)=>{
   
    //미들웨어를 통과해왔는 얘기는 auth가 true라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role ===0?false:true,
        isAuth : true,
        email: req.user.email
    }); 

});

app.get('/api/users/logout', auth, (req,res)=>{
    User.findOneAndUpdate({_id:req.user._id},
        {token:""},
        (err,user)=>{
            if(err) return res.json({success:false, err});
            return res.status(200).send({success:true});
        });

});

app.listen(port,() => console.log(`example app listeninf on port ${port}!`));