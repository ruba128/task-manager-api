const sgMail= require('@sendgrid/mail')
// const sendgridAPIKey =''
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail= (email,name) =>{
    sgMail.send({
        to: email,
        from:'rubamutasim335@gmail.com',
        subject:'thanks for joining in!',
        text: `welcome to the app, ${name}. let me know how it works for you!`
    })
}


const sendDeletionEmail= (email,name) =>{
    sgMail.send({
        to: email,
        from:'rubamutasim335@gmail.com',
        subject:'bye bye!',
        text: `we are sorry you're leavineg, ${name}. was there anything we could have done to keep you?`
    })
}

module.exports={
    sendWelcomeEmail,
    sendDeletionEmail
    
    
}