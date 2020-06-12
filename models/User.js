const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

const User = mongoose.model('User', userSchema);

module.exports = {User} //다른파일에서도 쓰고 싶을때 