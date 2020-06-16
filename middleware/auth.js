const { User } = require('../models/User');
//const {User} = require('./models/User');

let auth = (req, res, next) =>{
    //인증처리

    //클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;
    
    //토큰을 복호화 한 후 유저를 찾는다.
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true});

        //라우터에서 사용하기 위해
        req.token = token; 
        req.user = user;

        next();// ->없으면 미들웨어에서 갇혀버린다.
    });

    //유저가 있으면 인증 O
    //없으면 X


};

module.exports={auth};