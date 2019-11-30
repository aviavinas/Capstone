import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from numpy import loadtxt
from keras.models import load_model


data=pd.read_csv("dataset.csv")
data=data.drop(columns=["max_capacity","inventory_to_sale_ratio"])

print(data.info())

print(data.Item.unique())


#------------------------------------------------------------#

#label encoding

from sklearn.preprocessing import LabelEncoder
lbe=LabelEncoder()

data["Item"]=lbe.fit_transform(data["Item"])
data["day"]=lbe.fit_transform(data["day"])
data["Weather"]=lbe.fit_transform(data["Weather"])

#one hot eencoding
print(data.Item.unique())

Items = data.pop('Item')
data['Rice bowl'] = (Items == 6)*1
data['Thali Normal'] = (Items == 7)*1
data['Paratha'] = (Items == 3)*1
data['Chole Batura'] = (Items == 1)*1
data['Pav Bhaji'] = (Items == 4)*1
data['Veg Biryani'] = (Items == 8)*1
data['Burger'] = (Items == 0)*1
data['Manchurian'] = (Items == 2)*1
data['Veg Noodles'] = (Items == 9)*1
data['Pizza'] = (Items == 5)*1


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

data=data.drop(columns=['Weather_Bad','Crowd_No'])

data=data.drop(columns=["price"])
print(data.info())
print(data.columns)

#------------------------------------------------------------#

for i in range(0,1):
    
    Item_name=input("Enter the name of Item: ")
    
    data.drop(data[data[Item_name]== 0].index, inplace = True)
    print(data.info())
    print(data.columns)
    
    X=data.drop(columns=["count sell","Crowd"])
    y_sell=data["count sell"]
    y_crowd=data["Crowd"]
    
    from sklearn.model_selection import train_test_split
    X_train,X_test,y_sell_train,y_sell_test=train_test_split(X,y_sell,test_size=0.35,random_state=1)
    
    #------building a model-----#
    def model_build():
        model=keras.Sequential([
                layers.Dense(64,activation="relu",input_shape=[len(X.keys())]),
                layers.Dense(64,activation="relu"),layers.Dense(1)
                ])
        opt=tf.keras.optimizers.RMSprop(0.001)
        model.compile(loss='mse',
                  optimizer=opt,
                  metrics=['mse','mae'])
        return model
    
    model=model_build()
    model.summary()
    
#------------------------------------------------------------#
    
    iter=10
    model.fit(X,y_sell,epochs=iter, validation_split=0.2,verbose=1)
    loss,mae,mse = model.evaluate(X,y_sell,verbose=2)
    pred=model.predict(X_test)
    
#------------------------------------------------------------#
    
    import os
    import os.path
    path=os.path.join(os.sep, 'home', 'sky', 'Documents','Capstone')
    
    name=(Item_name.title()+'.h5')
    model.save(name)
      
    # load model
    loaded_model = tf.keras.models.load_model(path+'/'+name)
    print(loaded_model)
    
    loaded_model.summary()
    
#------------------------------------------------------------#
    
    pred=loaded_model.predict(X)
    from sklearn.metrics import r2_score,explained_variance_score,accuracy_score
    print( "R2 score: ",r2_score(y_sell,np.round(pred)))
    print( "variance_score: ",explained_variance_score(y_sell,np.round(pred)))
    print( "Accuracy_score: ",accuracy_score(y_sell,np.round(pred),normalize=False))
    

#------------------------------------------------------------#
    