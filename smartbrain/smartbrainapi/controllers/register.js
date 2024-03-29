const  { Password }  = require('../helpers/password');
const passwordHasher = new Password()

const tableName = 'users'
const handleRegister = async (req,res,db) => {
    const { email, name, password} = req.body
    // const salt = bcrypt.genSaltSync(10);
    const hash = await passwordHasher.toHash(password);
    console.log('second hash',hash)
    console.log("hash is", hash)
    if (!email || !name || !password) {
        return res.json({"error":'incorrect form submision'})
        // return res.status(400).json('incorrect form submision')
    }
    db.transaction(trx => {
        trx.insert({
            hash:hash,
            email:email
        }).into('login')
        .returning('email')
        .then(loginEmail => {
            return trx(tableName)
                .returning('*')
                .insert({
                    email: email,
                    name: name,
                    joined: new Date()
                }).then(user => {
                    res.json(user[0])
                    console.log("registered", user)
                })
        }).then(trx.commit).catch(trx.rollback)
    }).catch(err=> res.json(err))
}


module.exports = {
    handleRegister:handleRegister
}
