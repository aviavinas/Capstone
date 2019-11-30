import numpy as np
import tensorflow as tf
from tensorflow import keras
from numpy import loadtxt
from keras.models import load_model
from keras.utils.data_utils import get_file
from google.cloud import firestore

def engine(request):
    args = request.args
    db = firestore.Client()
    item = db.collection('product').document(args['id']).get().to_dict()

    def data(time, ITEM, Weather, day):
        daylist=[0,0,0,0,0,0,0]

        def check(daylist,day):
            daylist[day-1]=1
            return daylist

        newdaylist=check(daylist,day)
        for i in range(len(newdaylist)):
            newdaylist[i]  

        return np.array([[time,newdaylist[0],newdaylist[1],newdaylist[2],newdaylist[3],newdaylist[4],newdaylist[5],newdaylist[6],Weather]])

    def prediction(time, ITEM, Weather, day):
        loaded_model = tf.keras.models.load_model(get_file('modelFile', item['model']))
        predictions=np.round(loaded_model.predict(data(time, ITEM, Weather, day)))
        print("Sells @ ",time,":",predictions)
        return prediction

    prediction(10, 2, 1, 1)
