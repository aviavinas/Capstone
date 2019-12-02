var chart, chartLabel=[];
const maxHr = 24, minHr = 10;
var curHour = new Date().getHours();
curHour = curHour<minHr?minHr:curHour;
curHour = curHour>maxHr?maxHr:curHour;
var remH = maxHr-curHour;
var hrs = [], wthr = [];

function main() { // main function
    getProdList();
}

function drawChart(data) {
    chart = new Chart(document.getElementById('myChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: chartLabel,
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

function getProdList() {
    var htm = "";
    db.collection("product").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            htm+= "<tr data-id='"+doc.id+"'><td>"+doc.data().name+"</td><td>"+doc.data().sold+"</td><td>"+doc.data().inventory+"</td></tr>"
        });
        $('#prod').html(htm);
        $("#prod tr").click(function(){handleSelect(this)});      
        loadWeather();
    }).catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function handleSelect(k) {
    const id = $(k).attr("data-id");
    console.log("Loading new item...");
    showProgress();
    getPred(id);
}

function getPred(id) {
    $.get("/api?id="+id+"&time="+hrs.join()+"&weather="+wthr.join(), (r) => {
        console.log(r);
        drawChart(r.split(","));
        showPage();
    });
}

function loadWeather() {
    $.get("https://api.weatherbit.io/v2.0/forecast/hourly?city=Phagwara,IN&key=3a1f4eb49895428eadf479902b542b54&hours="+remH, (r) => {
        var htm="";
        hrs=[];
        wthr=[];
        chartLabel=[];
        for(i=curHour; i<maxHr; i++) {
            var isGoodWeather = r.data[i-curHour].weather.code>=700;
            timeSpell = (i==12?12:i%12)+' '+(i>=12?"PM":"AM");
            // Save datapoints
            hrs.push(i);
            wthr.push(isGoodWeather?1:0);
            chartLabel.push(timeSpell);
            // Append to html
            htm+= '<div class="col-1"><img src="'+(isGoodWeather?"sun":"cloud")+'.png"/>'+timeSpell+'</div>';
        }
        $("#weatherMap").html(htm);
        getPred($("#prod").children("tr").first().attr("data-id")); 
    })
}

function showPage() {
    $("#loader-cont").hide();
}

function showProgress() {
    $("#loader-cont").show();
}

function speak(msg) {
    $.post("/speak", { msg: msg }, (data) => playAudio(data));
}

function playAudio(base64string) {
    var snd = new Audio("data:audio/mp3;base64," + base64string);
    snd.play();
}