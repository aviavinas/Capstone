var chart, chartLabel=[];
const maxHr = 22, minHr = 10;
var curHour = new Date().getHours();
curHour = curHour<minHr?minHr:curHour;
curHour = curHour>maxHr?maxHr:curHour;
var remH = maxHr-curHour;
var hrs = [], wthr = [];
var lang = "en";
var audSpch = "";

function main() { // main function
    getProdList();
    $("#loader-cont").click(() => showPage());

    $("#predict").click(() => {
        $.get("/engine?id="+$("#itemSel").val()+"&time="+$("#timeSel").val()+"&day="+$("#daySel").val()+"&weather="+$("#weatherSel").val(), (r) => {
            console.log(r);
            $("#predRes").text(r+" item will be Sold");
            speak("Tere is a probability of selling "+r+" items", r+" item ki sale hone ki sambhavna hai");
        });
    });

    $("#playBtn").click(() => {
        $("#playBtn").hide();
        $("#pauseBtn").show();
        playAudio(audSpch);
    });

    $("#pauseBtn").click(() => {
        $("#pauseBtn").hide();
        $("#playBtn").show();
    });

    $('#langSel').on('change', function(e) {
        lang = $('#langSel').val();
    });
}

function drawChart(data, label) {
    chart = new Chart(document.getElementById('myChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: chartLabel,
            datasets: [{
                label: label+" sales",
                data: data,
                backgroundColor: ['rgba(134, 221, 146, 0.5)'],
                borderColor: ['rgba(134, 221, 146, 1)'],
                borderWidth: 2
            }]
        },
    });    
}

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDxSdGq5JDDD5QZlQxwvqURjyT7Rpgmu5c",
    authDomain: "salest.firebaseapp.com",
    databaseURL: "https://salest.firebaseio.com",
    projectId: "salest",
    appId: "app-id"
});

const db = firebase.firestore();

function getProdList() {
    var htm = "";
    db.collection("product").orderBy("sn").get().then(function(querySnapshot) {
        var i = 1;
        var itemLstSel="";
        querySnapshot.forEach(function(doc) {
            htm+= "<tr data-id='"+doc.id+"'><td>"+(i++)+"</td><td>"+doc.data().name+"</td></tr>";
            itemLstSel+= "<option value='"+doc.id+"'>"+doc.data().name+"</option>";
        });

        $('#prod').html(htm);
        $("#prod tr").click(function(){handleSelect(this)});      
        $("#itemSel").html(itemLstSel);
        loadWeather();
    }).catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function handleSelect(k) {
    const id = $(k).attr("data-id");
    console.log("Loading new item...");
    showProgress();
    getPred(id, $(k).text());
}

function getPred(id, label) {
    $("[data-id="+id+"]").parent().children().removeClass("act");
    $("[data-id="+id+"]").addClass("act");
    $.get("/api?id="+id+"&time="+hrs.join()+"&weather="+wthr.join(), (r) => {
        pred = r.split(",");
        drawChart(pred, label);
        showPage();
        formNews(pred);
        console.log(pred);
    });
}

function formNews(pred) {
    var name = $(".act td:nth-child(2)").text();
    var newsEn = "", newsHi;
    // Next hour
    newsEn+= "Next hour there is a probability of selling "+pred[0]+" "+name;
    newsHi+= "Agle ghante "+pred[0]+" "+name+" sale hone ki sambhavna hai";

    // Max
    var max = Math.max.apply(null, pred);
    newsEn+= ",  "+" Throughout the day today at "+chartLabel[pred.indexOf(max.toString())]+" there will be increase in demand of "+name+" and sale of this item can reach upto "+max+" items";
    newsHi+= ",  "+" Aaj pure din me "+chartLabel[pred.indexOf(max.toString())]+" par aaj "+name+" ki demand "+max+" sale tak pahunch sakti hai";

    // Min
    var min = Math.min.apply(null, pred);
    newsEn+= ",  "+" while today at "+chartLabel[pred.indexOf(min.toString())]+" there will be low demand of "+name+" and sale of this item can fall down to "+min+" items";
    newsHi+= ",  "+" Wahi aaj "+chartLabel[pred.indexOf(min.toString())]+" par aaj "+name+" ki sale me girawat hokar "+min+" sale tak pahunch sakti hai";

    speak(newsEn, newsHi);
}

function loadWeather() {
    $.get("https://api.weatherbit.io/v2.0/forecast/hourly?city=Phagwara,IN&key=3a1f4eb49895428eadf479902b542b54&hours="+remH, (r) => {
        var htm="";
        hrs=[];
        wthr=[];
        chartLabel=[];
        var timeSelItm = "";
        for(i=curHour; i<maxHr; i++) {
            var isGoodWeather = r.data[i-curHour].weather.code>=700;
            timeSpell = (i==12?12:i%12)+' '+(i>=12?"PM":"AM");
            // Save datapoints
            hrs.push(i);
            wthr.push(isGoodWeather?1:0);
            chartLabel.push(timeSpell);
            // Append to html
            htm+= '<div class="col-1"><img src="'+(isGoodWeather?"sun":"cloud")+'.png"/>'+timeSpell+'</div>';
            timeSelItm+= "<option value='"+i+"'>"+timeSpell+"</option>";
        }
        $("#weatherMap").html(htm);
        $("#timeSel").html(timeSelItm);
        getPred($("#prod").children("tr").first().attr("data-id"), $("#prod").children("tr").first().text()); 
    })
}

function showPage() {
    $("#loader-cont").hide();
}

function showProgress() {
    $("#loader-cont").show();
}

function speak(msgEn, mshHi) {
    if(lang=="en") {
        $.post("/speak", { msg: msgEn }, (data) => {
            audSpch = data;
            playAudio(data);
        });
    } else {
        $.post("/speak", { msg: mshHi }, (data) => {
            audSpch = data;
            playAudio(data);
        });
    }
}

function playAudio(base64string) {
    var snd = new Audio("data:audio/mp3;base64," + base64string);
    snd.play();
}
