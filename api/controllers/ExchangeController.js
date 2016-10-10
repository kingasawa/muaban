/**
 * ExchangeController
 *
 * @description :: Server-side logic for managing exchanges
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


	sell: (req,res) => {
    let data = {
      version: '1.0.0'
    };
    let params = req.allParams();
    sails.log.info(params);

    Item.find(function(err,foundItem){
      data.foundItem = foundItem;
        Item.findOne({link:params.i}).exec(function(err,findType){
          data.price_sell = findType.price_sell;
          data.name = findType.name;
          data.icon = findType.icon;
          return res.view("homepage",data)
        })
    })
  },

  ban: (req,res) => {
    let data = {
      currentDate: (new Date()).toString()
    };
    if (!req.isSocket) {
      return res.badRequest()
    }
    let params = req.allParams();
    Exchange.findOne({code:params.excode}).exec(function(err,existscode){
      if (existscode) {
        var newcode = 'a'+existscode.code;
      } else {
        var newcode = params.excode;
      }
      Exchange.create({
        ex: 'Bán',
        quantity: params.quantity_sell,
        item: params.item_sell,
        price: params.money_recieve,
        code: newcode,
        name: params.name_vcb,
        number: params.number_vcb,
        status: 'Pending'
      }).exec(function(err,done) {
        if (err) {
          return res.negotiate(err);
        }
        sails.log('giao dịch mới tạo : ',done);
        sails.sockets.join(req, params.excode);
        sails.sockets.broadcast(params.excode,'sell/pending',{send_code:newcode});
        sails.sockets.blast('add/exchange',done);
      })
    });

  },

  view: (req,res) => {
    let params = req.allParams();
    Exchange.findOne({code:params.i}).exec(function(err,foundBill){
      return res.view('templates/check',{foundBill})
    });
  },

  manager: (req,res) => {
    sails.log.info('who is login ?',req.session.user.group);
    Exchange.find(function(err,allExchange) {
      if (err) {
        return res.negotiate(err)
      }
      res.view('admin/ex_manager',{allExchange});
    });
  },

  action: (req,res) => {
    let magiaodich = req.params.i;
    Exchange.findOne({code:magiaodich}).exec(function(err,result) {
      return res.view('admin/process',result);
    })
  },

  item_manager : (req,res) => {
    Item.find(function(err,data){
      if (err) {
        return res.negotiate(err)
      }
      return res.view('admin/item_manager',data)
    });
  },

  item_add: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest()
    }
    let params = req.allParams();
    Item.create({params}).exec(function(err,result){
      if (err) {
        return res.negotiate(err)
      }
      sails.sockets.join();
      sails.socket.broadcast('','',{})
    })
  }
};
