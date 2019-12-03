import numpy as np
import tensorflow as tf
from tensorflow import keras
from numpy import loadtxt
from keras.models import load_model
from keras.utils.data_utils import get_file
from google.cloud import firestore

def engine(request):
    args = request.args.to_dict()
    print(args)
    db = firestore.Client()
    item = db.collection('product').document(request.args.get("id")).get().to_dict()

    def data(time, Weather, day):
        daylist=[0,0,0,0,0,0,0]

        def check(daylist,day):
            daylist[day-1]=1
            return daylist

        newdaylist=check(daylist,day)
        return np.array([[time,newdaylist[0],newdaylist[1],newdaylist[2],newdaylist[3],newdaylist[4],newdaylist[5],newdaylist[6],Weather]])

    def prediction(time, Weather, day):
        loaded_model = tf.keras.models.load_model(get_file('modelFile', item['model']))
        predictions=np.round(loaded_model.predict(data(time, Weather, day)))
        result = str(int(predictions[0][0]))
        print("Result @ ",time,":",result)
        return result

    return prediction(int(args['time']), int(args['weather']), int(args['day']))
