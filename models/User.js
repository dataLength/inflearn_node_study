const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique:1
    },
    password:{
        type: String,
        minlength:5
    },
    lastname:{
        type: String,
        maxlength:50
    },
    role:{
        type: Number,
        default: 0
    },
    image: String,
    token:{
        type: String
    },
    tokenExp:{
        type: Number
    }
});

userSchema.pre('save',function(next){
    var user = this;
    const myPlaintextPassword = user.password;
    if(user.isModified('password')){
        
        bcrypt.genSalt(saltRounds,(err,salt)=>{
            if(err){ 
                return next(err);
            }
            bcrypt.hash(myPlaintextPassword,salt,(err,hash)=>{
                if(err){
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
        


    //비밀번호 암호화
   /*  bcrypt.genSalt(saltRounds, function(err,salt){
        if(err){ 
            return next(err);
        }
        bcrypt.hash(myPlaintextPassword,salt,function(err,hash){
            if(err){
                return next(err);
            }
            user.password = hash;
            next();
        });
    }); */
    }else{
        next();
    }
   
    
});
userSchema.methods.comparePassword = function(plainPassword,cb){
    //plainpassword: 1234567
    //암호화된 비밀번호: $2b$10$th3YRwAV5KYpO0uO0IABZOtRPuwUfuRUtoOkC8f3nPFDXgFeKReGe
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    });
};

userSchema.methods.generateToken = function(cb){
    let user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    let token = jwt.sign(user._id.toHexString(),'secretToken');
    //user._id + 'secretToken' = token

    user.token = token;
    user.save((err,user)=>{
        if(err) return cb(err);
        cb(null,user);
    });
};

userSchema.statics.findByToken = function(token,cb){
    let user = this;

    //user._id + 'secretToken'
    //토큰을 디코드
    jwt.verify(token,'secretToken', function(err,decoded){
        console.log('decoded:'+decoded);
        console.log('token:'+token)
        //유저 id를 이용해서 유저를 찾은 다음에 
        //클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decoded, "token":token},function(err,user){
            console.log("user::"+user);
            if(err) return cb(err);
            cb(null, user);
        });
    });
}

const User = mongoose.model('User', userSchema);

module.exports = {User};//다른파일에서도 쓰고 싶을때 