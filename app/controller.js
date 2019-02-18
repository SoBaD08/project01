// ./app/controller.js
var cloudinary = require('cloudinary');
var Model = require('./model');
var EOS = require('eosjs');

var EOS_CONFIG = {
    contractName: "tfuntester12", // Contract name
                            // 메인넷에서 사용chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca', 
                            // Jungle Testnet  http://dev.cryptolions.io:38888/v1/chain/get_info 
    contractSender: "tfuntester12", // User executing the contract (should be paired with private key)
                            // existing account (active) private key that has ram cpu and bandwidth already purchased(staked)
    clientConfig: {
        httpEndpoint: 'https://jungle.eosio.cr:443', // EOS http endpoint for Jungle Testnet
        keyProvider: ['5K9kbDdpdXbrCp5ZBoPgDYLXQ9PXdx7gT7BLZ84av9GNH3SekZs'], // Your private key
        chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'
    }
};

cloudinary.config({
    cloud_name: 'myimagestores',
    api_key: '269346162529658',
    api_secret: 'UC_9e-bLhFZIwWWtF1oFkwy5448'
});


// EOS.getTableRows({
//     code:'CONTRACT_NAME',
//     scope:'SCOPE_ACCOUNT (Normally contract)',
//     table:'TABLE_NAME',
//     json: true,
// }).then(function(res) {
//     console.log(res);
// });


module.exports = {
  index: function (req, res) {
      Model.find({}, function (err, posts) {
          if(err) res.send(err);

          res.render('pages/index', {posts: posts});
      });
  },
  find: function (req, res) {
      var id = req.params.id;
      Model.findOne({image_id: id}, function (err, post) {
          if (err) res.send(err);

          res.render('pages/single', {post: post, image: cloudinary.image, image_url: cloudinary.url});
      })
  },
  new: function (req, res) {
      res.render('pages/new');
  },
  edit: function (req, res) {
      Model.find({image_id: req.params.id}, function (err, posts) {
          if(err) res.send(err);

          res.render('pages/edit', {post: posts[0]});
      });
  },
  create: function (req, res) {
      this.eosClient = EOS(EOS_CONFIG.clientConfig);
      cloudinary.v2.uploader.upload(req.files.image.path,
          { tags: req.body.tags },
          function(err, result) {
              console.log(result);
              var post = new Model({
                  title: req.body.title,
                  description: req.body.description,
                  created_at: new Date(),
                  image: result.url,
                  image_id: result.public_id
              });

              post.save(function (err) {
                  if(err){
                      res.send(err)
                  }
                   this.eosClient.contract(EOS_CONFIG.contractName).then(function(contract) {
                      contract.create(
                          EOS_CONFIG.contractSender,
                          2, //12,11
                          //post.cId,
                          req.body.title,
                          req.body.description,
                          post.image,
                          post.image_id,
                          post.created_at,
                          { authorization: [EOS_CONFIG.contractSender], permission:'active'}
                        )
                        .then(function(res) {
                          //_this4.setState({ loading: false });
                        })
                        .catch(function(err) {
                          //_this4.setState({ loading: false });
                          console.log(err);
                        });
                    });
                  res.redirect('/');
              });
      });
  },
  update: function (req, res) {
      var oldName = req.body.old_id
      var newName = req.body.image_id;
      cloudinary.v2.uploader.rename(oldName, newName,
          function(error, result) {
              if (error) res.send(error);
              Model.findOneAndUpdate({image_id: oldName},
                  Object.assign({}, req.body, {image: result.url}),
                  function (err) {
                  if (err) res.send(err);

                  res.redirect('/');
              })
          })

  },
  destroy: function (req, res) {
      var imageId = req.body.image_id;
      cloudinary.v2.uploader.destroy(imageId, function (error, result) {
              Model.findOneAndRemove({ image_id: imageId }, function(err) {
                  if (err) res.send(err);

                  res.redirect('/');
              });
          });
  },

    admin:{
        index: function (req, res) {
            var q = req.query.q;
            var callback = function(result){
                var searchValue = '';
                if(q){
                    searchValue = q;
                }
                res.render('admin/index', {posts: result.resources, searchValue: searchValue});
            };
            if(q){
                cloudinary.api.resources(callback,
                    { type: 'upload', prefix: q });
            } else {
                cloudinary.api.resources(callback);
            }
        }
    }
};
