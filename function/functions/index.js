const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

exports.speak = (req, res) => {
    async function main() {
      const client = new textToSpeech.TextToSpeechClient();
      const text = req.body.msg;

      const request = {
        input: {text: text},
        voice: { languageCode: "hi-IN", name: "hi-IN-Wavenet-A" },
        audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 0.96 },
      };

      const [response] = await client.synthesizeSpeech(request);

      dataBase64 = arrayBufferToBase64(response.audioContent);
      console.log(dataBase64);
      res.send(dataBase64);
    }

    function arrayBufferToBase64( buffer ) {
        return Buffer.from(buffer).toString('base64')
    }
    main();
};
