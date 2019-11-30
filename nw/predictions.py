import numpy as np
import tensorflow as tf
from tensorflow import keras
from numpy import loadtxt
from keras.models import load_model
import os
import os.path
path=os.path.join(os.sep, 'home', 'sky', 'Documents','Capstone')
   
   
# load model

name=input("Enter the name of Item:\n").title()

loaded_model = tf.keras.models.load_model(path+'/'+name+'.h5')

#------------------------------------------------------------#
    

def prediction(data):
    predictions=np.round(loaded_model.predict(data))
    print("Sells:",predictions)


def data():
    c1=0;
    while(c1==0):
        time=int(input("CHOOSE TIME From 10 AM TO 22 PM\n"))
        if(time>22 or time<10):
            print("Invalid")
            c1=0
        else:
            c1+=1
    #-------------------------------------------#
    
    if(name=='Rice Bowl'):
        ITEM=1
    elif(name=='Thali Normal'):
        ITEM=2
    elif(name=='Paratha'):
        ITEM=3
    elif(name=='Chole Batura'):
        ITEM=4
    elif(name=='Pav Bhaji'):
        ITEM=5
    elif(name=='Veg Biryani'):
        ITEM=6
    elif(name=='Burger'):
        ITEM=7
    elif(name=='Manchurian'):
        ITEM=8
    elif(name=='VegNoodles'):
        ITEM=9
    elif(name=='Pizza'):
        ITEM=0
    else:
        print('Invalid')
    
    Itemlist=[0,0,0,0,0,0,0,0,0,0]
        
    def check(Itemlist,ITEM):
        Itemlist[ITEM-1]=1
        return Itemlist
        
    
    newitemlist=check(Itemlist,ITEM)
    for i in range(len(newitemlist)):
        newitemlist[i]  
    
    #-------------------------------------------#
    c3=0
    while(c3==0):
        day=int(input("Enter 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday\n"))
        if(day>7 or day<0):
            print("Invalid")
            c3=0
        else:
            c3+=1
    daylist=[0,0,0,0,0,0,0]
    
    def check(daylist,day):
        daylist[day-1]=1
        return daylist
    
    newdaylist=check(daylist,day)
    for i in range(len(newdaylist)):
        newdaylist[i]  
    
    #-------------------------------------------#
    c4=0
    while(c4==0):
        Weather=int(input("CHOOSE WEATHER:- 1 for GOOD & 0 for BAD\n"))
        if(Weather>1 or Weather<0):
            print("Invalid")
            c4=0
        else:
            c4+=1
    
    #-------------------------------------------#
    
    return np.array([[time,newitemlist[0],newitemlist[1],newitemlist[2],newitemlist[3],newitemlist[4],newitemlist[5],newitemlist[6],newitemlist[7],newitemlist[8],newitemlist[9],newdaylist[0],newdaylist[1],newdaylist[2],newdaylist[3],newdaylist[4],newdaylist[5],newdaylist[6],Weather]])
      
#------------------------------------------------------------#


prediction(data())



