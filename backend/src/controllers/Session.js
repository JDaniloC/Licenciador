const Seller = require('../models/Seller');
const MD5 = require('./utils/MD5'); 

module.exports = {
    async store(request,response){
        const {email, password} = request.body;
        
        if (!email || !password) {
            return response.json({
                error: 'Params required: email, password'
            });
        }
        let conta = await Seller.findOne({ email });
        let encrypted = MD5(password);
        let result = {};
        if (conta) {
            if (conta.password) {
                if (conta.password === encrypted) {
                    result = conta;
                }
            } else {
                await Seller.findOneAndUpdate(
                    { email }, {password: encrypted}
                );
                result = conta;
            }
        } 
        return response.json(result);
    }
}