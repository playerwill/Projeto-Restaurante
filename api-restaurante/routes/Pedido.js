const express = require('express');
const router = express.Router();

const Pedido = require('../models/Pedido');
const OpcaoDePrato = require('../models/OpcaoDePrato')


router.post('/', async (req,res)=> {
    console.log(`GET REQUEST`);
    try{
        //Transforma o objeto de recebimento em dois arrays
        const pratos = Object.keys(req.body);
        const qntbruto = Object.values(req.body);
        //Tira o email dos arrays
        pratos.splice(pratos.indexOf('email'), 1);
        //Tira forma de pagamento
        pratos.splice(pratos.indexOf('formaPagamento'), 1);
        //Tira o endereço
        pratos.splice(pratos.indexOf('endereco'), 1);
        console.log(pratos)
        const qnt = qntbruto.filter(x => typeof x === "number");
        const opcoesArray = [];
        let prato;
        let precoTotalDoPrato;
        for (let index = 0; index < pratos.length; index++) {
            prato = await OpcaoDePrato.findById(pratos[index]);
            precoTotalDoPrato = prato.preco * qnt[index];
            opcoesArray.push({nomePrato: prato.nome, quantidade: qnt[index], valor_unitario:prato.preco, valor_total_do_prato: precoTotalDoPrato})            
        }

        let valorTotalPedido = opcoesArray.reduce((accumulador, elementoAtual) => {return accumulador + elementoAtual.valor_total_do_prato}, 0);
        const pedido = new Pedido({
            opcoes: opcoesArray,
            cliente: req.body.email,
            endereco: req.body.endereco,
            formaPagamento: req.body.formaPagamento,
            valorTotal: valorTotalPedido
        });
        const novoPedido = await pedido.save();
        res.status(200).json({message:"Pedido feito com sucesso!",pedido:novoPedido})
    } catch(err){
        res.status(400).json({message: err.message});
    }
})

module.exports = router