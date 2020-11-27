const express= require('express')
const router = new express.Router()
const task= require('../models/task.js')
const auth = require('../middleware/auth.js')


router.post('/tasks',auth, async (req,res)=>{
    // const tsk=new task(req.body)
    const tsk = new task({
        ...req.body,
        owner: req.user._id
    })


    try {
        await tsk.save()
        res.status(201).send(tsk)
        
    } catch (e) {
        res.status(400).send(e)
        
    }

})



//GET /tasks?completed=boolean
//GET /tasks?limit=10&skip=0 
//GET /tasks?sort=
router.get('/tasks',auth, async (req,res)=>{
    const match ={}
    const sort ={}
    if (req.query.completed) {
        match.completed= req.query.completed ==='true'
        
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        
    }
    
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
            }
            }).execPopulate()
        // const tasks=await  task.find({
        //     owner:req.user._id
        // })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }

})

//reading single task
router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id
    try {
        const tskk=await task.findOne({_id,owner:req.user._id})
        if (!tskk) {
            return res.status(404).send()
            
        }
        res.send(tskk)
        
    } catch (e) {
        res.status(500).send()
        
    }
})


router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedOperations=['completed','description']
    const isValidOPeration= updates.every((update)=>allowedOperations.includes(update))
    if (!isValidOPeration) {
        return res.status(404).send({error:'invalid updates!!'})      
    }
    try {
        const taskola=await task.findOne({
            _id:req.params.id,
            owner: req.user._id
        })
        if (!taskola) { 
            return res.status(404).send()   
        }
        updates.forEach((update)=> taskola[update]=req.body[update] )
        await taskola.save()
        res.send(taskola)
        
    } catch (e) {
        res.status(400).send(e) 
        
    }




})
//delete a task 
router.delete('/tasks/:id',auth, async (req,res)=>{
    try {
        const tskk = await task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if (!tskk) {
            return res.status(404).send() 

            
        }
        res.send(tskk)
    } catch (e) {
        res.status(500).send()

        
    }
})


module.exports= router