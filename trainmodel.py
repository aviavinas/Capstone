import math
import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from google.cloud import firestore

def todayForecast(request):
    item_id="DQRP4NDTzWkRGZmnK8Ol"
    db = firestore.Client()

    data=pd.read_csv("https://raw.githubusercontent.com/aviavinas/Capstone/master/datasets/Ricebowl.csv")
    data=data.drop(columns=["Item","price","inventory_to_sale_ratio"])

    from sklearn.preprocessing import LabelEncoder
    lbe=LabelEncoder()
    data["day"]=lbe.fit_transform(data["day"])
    data["Weather"]=lbe.fit_transform(data["Weather"])
    days = data.pop('day')
    data['Monday'] = (days == 1)*1
    data['Tuesday'] = (days == 5)*1
    data['Wednesday'] = (days == 6)*1
    data['Thursday'] = (days == 4)*1
    data['Friday'] = (days == 0)*1
    data['Saturday'] = (days == 2)*1
    data['Sunday'] = (days == 3)*1

    weather = data.pop('Weather')
    data['Weather'] = (weather == 1)*1
    data['Weather_Bad'] = (weather == 0)*1


    crowd = data.pop('crowded')
    data['Crowd_No'] = (crowd == 0)*1
    data['Crowd'] = (crowd == 1)*1

    data=data.drop(columns=['Weather_Bad','Crowd_No',"max_capacity","Crowd"])

    train_dataset=data.sample(frac=0.7, random_state=0)
    test_dataset=data.drop(train_dataset.index)
    
    #train_crowd_labels=train_dataset.pop("Crowd")
    #test_crowd_labels=test_dataset.pop("Crowd")

    train_stats= train_dataset.describe()
    train_stats.pop("count sell")
    train_stats=train_stats.transpose()        

    train_labels=train_dataset.pop("count sell")
    test_labels=test_dataset.pop("count sell")



    def norm(x):
        return (x- train_stats['mean']) / train_stats['std']

    norm_train_data= norm(train_dataset)
    norm_test_data= norm(test_dataset)


    def build_model():
        model=keras.Sequential([
                layers.Dense(64,activation="relu",input_shape=[len(train_dataset.keys())]),
                layers.Dense(64,activation="relu"),
                layers.Dense(1)                        
        ])

        opt=tf.keras.optimizers.RMSprop(0.001)
        model.compile(loss='mse',
                    optimizer=opt,
                    metrics=['mae','mse'])
        return model
                

    model=build_model()
    model.summary()

    batch=norm_train_data[:10]
    result=model.predict(batch)

    iter=1000

    model.fit(norm_train_data,train_labels,epochs=iter, validation_split=0.2,verbose=0)

    loss,mae,mse = model.evaluate(norm_train_data,train_labels,verbose=2)

    pred=model.predict(norm_test_data)
    print("Predicted Sell Count:",np.round(pred))
    print("Actual Sell Count ",test_labels)

    from sklearn.metrics import r2_score
    print("Accuracy :",r2_score(test_labels,pred))


    def prediction(data):
        predictions=np.round(model.predict(data))
        return predictions

    def getArgs(time,day,weather):        
        daylist=[0,0,0,0,0,0,0]

        def check(daylist,day):
            daylist[day-1]=1
            return daylist
        
        newdaylist=check(daylist,day)
        for i in range(len(newdaylist)):
            newdaylist[i]
                
        return np.array([[time,newdaylist[0],newdaylist[1],newdaylist[2],newdaylist[3],newdaylist[4],newdaylist[5],newdaylist[6],weather]])
    
    def predFor(time,weather):
        week_day=["","mon","tue","wed","thu","fri","sat", "sun"]
        d = datetime.datetime.today().weekday()+1
        pr = prediction(getArgs(time, d, weather))

        db.collection('forecast').document(item_id+"_"+week_day[d]+"_"+str(time)+"_"+str(weather)).set({
            'val': str(math.floor(pr[0][0])),
            'date': datetime.datetime.now()
        })

    def todayF():
        for h in range(6,23,2):
            predFor(h,1)
            predFor(h,0)

    todayF()
    return "Ok"
