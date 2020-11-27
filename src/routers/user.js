const express= require('express')
const multer = require('multer')
const sharp = require('sharp')
const user= require('../models/user.js')
const auth= require('../middleware/auth.js')
const {sendWelcomeEmail, sendDeletionEmail} = require('../emails/account')
const router = new express.Router()



//creating a user
router.post('/users',async (req,res)=>{
    const usr=new user(req.body)
    try {
        await usr.save()
        //sendWelcomeEmail(usr.email,usr.name)
        const token= await usr.generateAuthToken()
        res.status(201).send({usr,token})
        
    } catch (e) {
        res.status(400).send(e)  
        
    }

})


//logging in 
router.post('/users/login',async (req, res)=>{
    try {
        const User = await user.findByCredentials(req.body.email, req.body.password)
        const token= await User.generateAuthToken()

        res.send({User,token})
        
    } catch (e) {
        res.status(400).send()
        
    }   


})

//logging out 
router.post('/users/logout', auth, async (req,res)=>{
    try {
        req.user.tokens= req.user.tokens.filter((token)=>{
            return token.token!== req.token

        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
        
    }


})

//logging out all sessons
router.post('/users/logoutAll', auth, async (req,res)=>{
    try {
        req.user.tokens= []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
        
    }


})


//reading profile
router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
    // try {
    //     const users= await user.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
        
    // }
})


//update a user
router.patch('/users/me',auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedOperations=['name','age','email','password']
    const isValidOPeration= updates.every((update)=>allowedOperations.includes(update))
    if (!isValidOPeration) {
        return res.status(404).send({error:'invalid updates!!'})      
    }
    try {
        
        updates.forEach((update)=> req.user[update]=req.body[update] )
        await req.user.save()
        res.send(req.user)
        
    } catch (e) {
        res.status(400).send(e) 
        
    }




})

//delete a user 
router.delete('/users/me', auth, async (req,res)=>{
    try {
        // const usrr= await user.findByIdAndDelete(req.user._id)
        // if (!usrr) {
        // return res.status(400).send()
        
        // }
        await req.user.remove()
        //sendDeletionEmail(req.user.email, req.user.name)
        res.send(req.user)
        
    } catch (e) {
        res.status(400).send(e) 
        
    }

})



const upload = multer({
    limits:{
        fileSize:1000000
    }, 
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please provide an image!'))
            
        }
        cb(undefined,true)

    }
})

// upload avatar
router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar= buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


// delete avatar
router.delete('/users/me/avatar',auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
// ,(error,req,res,next)=>{
//     res.status(400).send({error:error.message})
// }

//view avatar 
router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const User = await user.findById(req.params.id)
        if (!User|| !User.avatar) {
            throw new Error()
            
        }
        res.set('Content-Type','image/png')
        res.send(User.avatar)
    } catch (e) {
        res.status(404).send()
        
    }


})

module.exports= router