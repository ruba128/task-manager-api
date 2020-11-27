const mongoose= require('mongoose')
const validator = require('validator')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken')
const task= require('./task.js')
const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true
    
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim: true,
        lowerCase:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email!')
                
            }
        }
    },
    age:{
        type:Number,
        default: 0,
        validate(value) {
            if (value<0) {
                throw new Error('age must be positive number!')    
            }
        }
    },
    
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value){
            if (value.toLowerCase().includes('password')) {
                throw Error('passwrod shouldnot contain password')
                
            }
        }
    },
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
    
    },{
        timestamps:true,
    }
)

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'

})
userSchema.methods.toJSON=  function() {
    const usr=this 
    const userObject= usr.toObject()
    delete userObject.password
    delete userObject.tokens 
    delete userObject.avatar 
    return userObject


}
userSchema.methods.generateAuthToken = async function() {
    const usr= this
    const token= jwt.sign({_id:usr._id.toString()},process.env.JWT_SECRET_KEY,{expiresIn: '7 days'})
    usr.tokens= usr.tokens.concat({token})
    await usr.save()
    
    return token

}
userSchema.statics.findByCredentials = async (email, password) => {
    const usr = await user.findOne({ email })

    if (!usr) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, usr.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return usr
}



//hash the password before save 

userSchema.pre('save',async function(next) {
    const userr = this
    if (userr.isModified('password')) {
        userr.password= await bcrypt.hash(userr.password,8)
        
    }

    next()

})

//delete tasks when user is removed
userSchema.pre('remove', async function(next) {
    const userr= this
    await task.deleteMany({
        owner:userr._id
    })




    next()

})



const user = mongoose.model('user',userSchema)

module.exports = user
