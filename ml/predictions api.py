import datetime
import numpy as np
import tensorflow as tf
from tensorflow import keras
from numpy import loadtxt
from keras.models import load_model
from keras.utils.data_utils import get_file
from google.cloud import firestore

def engineApi(request):
    args = request.args.to_dict()
    print(args)
    db = firestore.Client()
    item = db.collection('product').document(request.args.get("id")).get().to_dict()

    def data(time, Weather):
        days=[0,0,0,0,0,0,0]
        day = datetime.datetime.today().weekday()
        days[day]=1
        return np.array([[time,days[0],days[1],days[2],days[3],days[4],days[5],days[6],Weather]])

    def prediction(time, Weather):
        loaded_model = tf.keras.models.load_model(get_file('modelFile', item['model']))
        predictions=np.round(loaded_model.predict(data(time, Weather)))
        result = str(abs(int(predictions[0][0])))
        print("Result @ ",time,":",result)
        return result

    times = args['time'].split(",")
    wths = args['weather'].split(",")
    output = []
    for i, tm in enumerate(times):
        pred = prediction(int(tm), int(wths[i]))
        output.append(pred)

    return ",".join(output)
