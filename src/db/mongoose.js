const mongoose= require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify: false
})




// const tas = new task({
//     description:'sleep',
    
    
// })


// tas.save().then(()=>{
//     console.log('result', tas)
// }).catch((error)=>{
//     console.log('error',error)
// })