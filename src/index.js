const express = require('express')
require('./db/mongoose.js')
const { response } = require('express')
const { updateMany } = require('./models/user.js')
const userRouter = require('./routers/user.js')
const taskRouter= require('./routers/task.js')
const app = express()
const port= process.env.PORT




app.use(express.json())
app.use(userRouter)
app.use(taskRouter)









app.listen(port,()=>{
    console.log('server is up on port: '+port)
})
