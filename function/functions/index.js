/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const axios = require('axios');

exports.api = function api(req, res) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', 'GET, POST')

    axios.get('https://salest.firebaseapp.com/engine', {
        params: {
          ID: 12345
        }
      }).then((response) => {
        console.log(response);
        res.status(200).send('weeee!');
    }).catch((error) => {
        console.log(error);
      });
};