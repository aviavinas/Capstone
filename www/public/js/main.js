var chart;
function drawChart(data) {
    chart = new Chart(document.getElementById('myChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM'],
            datasets: [{
                label: 'Sales',
                data: data,
                backgroundColor: ['rgba(134, 221, 146, 0.5)'],
                borderColor: ['rgba(134, 221, 146, 1)'],
                borderWidth: 2
            }]
        },
    });    
}

var pie = new Chart(document.getElementById('myPie').getContext('2d'), {
    type: 'pie',
    data: {
        datasets: [{
            data: [63,41],
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 255, 255, 1)'
            ],
            borderWidth: 0
        }]
    }
});
pie.canvas.style.height = '75px';
pie.canvas.style.width = '75px';

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDxSdGq5JDDD5QZlQxwvqURjyT7Rpgmu5c",
    authDomain: "salest.firebaseapp.com",
    databaseURL: "https://salest.firebaseio.com",
    projectId: "salest",
    appId: "app-id"
});

const db = firebase.firestore();

function daysLeft(sec) {
    return parseInt((sec-((new Date())/1000))/86400);
}

function getDay() {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
}

function getPred(docId) {
    var data = [];
    const times = [6,8,10,12,14,16,18,20,22];
    times.forEach(function(time) {
        var weather = 1;
        db.collection("forecast").doc(docId+"_"+getDay()+"_"+time+"_"+weather).get().then(function(doc) {
            data.push(parseInt(doc.data().val));
            if(times.length==data.length) {
                console.log(data);
                drawChart(data);
            }
        }).catch(function(error) {
            console.log("Error getting cached document:", error);
        });
    });
}

function analyze() {
    var sold=0, inventory=0, oneDayEx=0;
    db.collection("product").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            sold+= doc.data().sold;
            inventory+= doc.data().inventory;
            if(daysLeft(doc.data().expire.seconds)==0) {
                oneDayEx+= doc.data().inventory;
            }

            $('#soldProd').text(sold);
            $('#invProd').text(inventory);
            $('#oneDayEx').text(inventory);
        });
    }).catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function getProdList() {
    var htm = "";
    db.collection("product").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            htm+= "<tr data-id='"+doc.id+"'><td>"+doc.data().name+"</td><td>"+doc.data().sold+"</td><td>"+doc.data().inventory+"</td></tr>"
        });
        $('#prod').html(htm);
        $("#prod tr").click(function(){handleSelect(this)});      
        showWeather();
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function handleSelect(k) {
    const id = $(k).attr("data-id");
    $.get("https://salest.firebaseapp.com/engine", (r) => console.log(r))
}

function showWeather() {
    var curHour = new Date().getHours();
    curHour = curHour<10?10:curHour;
    curHour = curHour>22?22:curHour;
    var remH = 22-curHour;

    $.get("https://api.weatherbit.io/v2.0/forecast/hourly?city=Phagwara,IN&key=3a1f4eb49895428eadf479902b542b54&hours="+remH, (r) => {
        var htm="";
        for(i=curHour; i<22; i++) {
            isGoodWeather = r.data[i-curHour].weather.code>=700;
            htm+= '<div class="col-1"><img src="'+(isGoodWeather?"sun":"cloud")+'.png"/>'+(i==12?12:i%12)+' '+(i>=12?"PM":"AM")+'</div>';
        }
        $("#weatherMap").html(htm);            
    })
}

analyze();
drawChart([0,5,63,41,95,28,55,89,34]);
getProdList();
