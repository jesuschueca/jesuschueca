// DECLARACION DE VARIABLES
var Timer1 = setInterval(firstRunner1,1000);
var Timer = setInterval(Time,500);
var reader1_Timings = []
var reader2_Timings = []
var reader3_Timings = []
var raceStartTime
var finish2 = 0
var finish3 = 0
var firstRunner
var secondRunner
var thirdRunner
var finish2
var finish3
var speed
var time

// FUNCION PARA PASAR DE MILISEGUNDOS A MINUTOS Y SEGUNDOS
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// OBTENER LOS DATOS DE LA CARRERA
firebase.database().ref('Data/01_RaceInfo').once('value', function (data) {
    raceInfo = data.val()
})

// OBTENER LOS DATOS DE LOS PARTICIPANTES
firebase.database().ref('Data/02_Participants').once('value', function (data) {
    participants = data.val()
})

//
cell=[]
cell.length = 2412;

// RECUPERA LA INFORMACIÓN DE LA PANTALLA DE "TRACK"
if (window.sessionStorage.getItem("dot_place")) {
    var dot_place = JSON.parse(window.sessionStorage.getItem("dot_place"));
    firstRunner = dot_place[1]
    secondRunner = dot_place[2]
    thirdRunner = dot_place[3]
    finish2 = dot_place[4]
    finish3 = dot_place[5]
    speed = dot_place[6]
}
else {
    firstRunner = 0;
    secondRunner = 0;
    thirdRunner = 0;
    finish2 = 0
    finish3 = 0
    speed = 1
}

//
function getData() {
    raceStartTime = new Date().getTime()
    window.sessionStorage.setItem("raceStartTime", JSON.stringify(raceStartTime));
    document.getElementById("button").setAttribute("class", "hidden");
}

// LLAMA A LA FUNCION PARA OBTENER LOS DATOS DE FIREBASE
getFirebaseDataon()

if (window.sessionStorage.getItem("raceStartTime")) {
    raceStartTime = window.sessionStorage.getItem("raceStartTime")
    document.getElementById("button").setAttribute("class", "hidden");
}

// FUNCION PARA CALCULAR EL TIEMPO QUE DESDE EL COMIENZO DE LA CARRERA
function Time() {
    now = new Date().getTime();
    if (raceStartTime) {
        time = (now - raceStartTime) * speed;
    }
    else {
        time = 0
    }
}

// LLAMA A LA FUNCION PARA OBTENER EL TIEMPO ACTUAL
Time()

// FUNCION QUE RECUPERA LA INFORMACION DE FIREBASE
function getFirebaseDataon() {
    firebase.database().ref('Data/03_Inbox').on('value', function (data) {
        keys = []
        reader0 = []
        reader1Inbox = []
        readerPositions = []
        reader2Positions = []
        reader2Inbox = []
        reader3Inbox = []
        pName = []
        pClub = []
        runnerdelays = []
        inbox = data.val()

        //
        Object.keys(inbox).forEach((key) => {
            keys.push(key)
            if (inbox[key].includes("Reader 3")) {
                reader3Inbox.push(inbox[key]);
            }
            if (inbox[key].includes("Reader 2")) {
                reader2Inbox.push(inbox[key]);
            }
            if (inbox[key].includes("Reader 1")) {
                reader1Inbox.push(inbox[key]);
            }
            if (inbox[key].includes("Reader 0")) {
                reader0.push(inbox[key]);
            }
        });
    });
}

//
function firstRunner1() {
    var reader1_Timings = []
    var reader2_Timings = []
    var reader3_Timings = []
    var readerPositions = []
    runnerdelays = []
    pName = []
    pClub = []

    //
    arduino0 = parseInt(reader0[0].slice(22)) * 1000 + parseInt(reader0[0].slice(36))
    reader0sync = arduino0 + new Date("Mar 31, 1900").getTime();

    //
    arduino3 = parseInt(reader3Inbox[0].slice(22)) * 1000 + parseInt(reader3Inbox[0].slice(36)) //change this
    reader3sync = arduino3 + new Date("Mar 31, 1900").getTime();
    for (i = 1; i <= reader3Inbox.length - 1; i++) {
        let t = reader3Inbox[i].slice(21, 31)
        let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3]);
        reader3_Timings.push(ms);
        if (time > reader3_Timings[i]) {
            readerPositions.push(parseInt(reader3Inbox[i].slice(-2)))
        }
    }

    //
    arduino2 = parseInt(reader2Inbox[0].slice(22)) * 1000 + parseInt(reader2Inbox[0].slice(36))
    reader2sync = arduino2 + new Date("Mar 31, 1900").getTime();
    for (i = 1; i <= reader2Inbox.length - 1; i++) {
        let t = reader2Inbox[i].slice(21, 31)
        let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3]) - arduino3 + arduino2;
        reader2_Timings.push(ms);
        if (time > reader2_Timings[i - 1]) {
            readerPositions.push(parseInt(reader2Inbox[i].slice(-2)))
        }
    }

    //
    arduino1 = parseInt(reader1Inbox[0].slice(22)) * 1000 + parseInt(reader1Inbox[0].slice(36))
    reader1sync = arduino1 + new Date("Mar 31, 1900").getTime();
    for (i = 1; i <= reader1Inbox.length - 1; i++) {
        let t = reader1Inbox[i].slice(21, 32)
        let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3]) - arduino3 + arduino1;
        reader1_Timings.push(ms);
        if (time > reader1_Timings[i - 1]) {
            readerPositions.push(parseInt(reader1Inbox[i].slice(-2)))
        }
    }

    //
    if (reader1_Timings[0]) {
        for (i = 1; i < participants.length; i++) {
            readerPositions.push(i)
        }
        let uniquePositions = [];
        readerPositions.forEach((c) => {
            if (!uniquePositions.includes(c)) {
                uniquePositions.push(c);
                pName.push(participants[c]["Nombre"] + " " + participants[c]["Apellido"])
                pClub.push(participants[c]["Equipo"])
            }
        }
        )

        // CREA LOS ELEMENTOS PARA LA CLASIFICACION
        document.getElementById("leaderboard").innerHTML = ""
        const div = document.createElement("div");
        const innerdiv = document.createElement("div");
        const name = document.createElement("div");
        const number = document.createElement("div");
        const time1 = document.createElement("div");
        const club1 = document.createElement("div");
        innerdiv.appendChild(number);
        innerdiv.appendChild(name);
        div.appendChild(innerdiv);
        div.appendChild(time1);
        document.getElementById("leaderboard").appendChild(div)
        number.innerHTML = 1;
        name.innerHTML = pName[0];
        name.appendChild(club1);
        club1.innerHTML = pClub[0]

        // MUESTRA EL TIEMPO DE LA CARRERA SI TODAVIA NO HA ACABADO
        if (time <= reader3_Timings[0]) {
            time1.innerHTML = millisToMinutesAndSeconds(time);
        }

        // AÑADE UNA BANDERA SI EL PARTICIPANTE HA ACABADO LA CARRERA
        if (time >= reader3_Timings[0]) {
            const img = document.createElement("img");
            img.setAttribute("class", "flag");
            img.setAttribute("src", "finish flag.png");
            time1.innerHTML = millisToMinutesAndSeconds(reader3_Timings[0]);
            time1.appendChild(img)
        }

        // CALCULA LA DIFERENCIA DE TIEMPOS CON EL PRIMER CLASIFICADO
        runnerdelays.push(raceStartTime)
        for (i = 1; i < reader1_Timings.length; i++) {
            if (time >= reader3_Timings[i]) {
                runnerdelays.push(reader3_Timings[i] - reader3_Timings[0])
            }
            else if (time >= reader2_Timings[i]) {
                runnerdelays.push(reader2_Timings[i] - reader2_Timings[0])
            }
            else if (time >= reader1_Timings[i]) {
                runnerdelays.push(reader1_Timings[i] - reader1_Timings[0])
            }
            else {
                runnerdelays.push(0)
            }
        }

        // AÑADE EL RESTO DE PARTICIPANTES A LA CLASICIACION
        for (i = 1; i < participants.length - 1; i++) {
            const div = document.createElement("div");
            const innerdiv = document.createElement("div");
            const name = document.createElement("div");
            const number = document.createElement("div");
            const time1 = document.createElement("div");
            innerdiv.appendChild(number);
            innerdiv.appendChild(name);
            div.appendChild(innerdiv);
            div.appendChild(time1);
            document.getElementById("leaderboard").appendChild(div)
            number.innerHTML = i + 1;
            name.innerHTML = pName[i];
            time1.innerHTML = "+" + millisToMinutesAndSeconds(runnerdelays[i]);
            if (time >= reader3_Timings[i]) {
                const img = document.createElement("img");
                img.setAttribute("class", "flag");
                img.setAttribute("src", "finish flag.png");
                time1.appendChild(img)
            }

            //LOS 3 PRIMEROS PARTICIPANTES TIENE ADEMÁS EL CLUB AL QUE PERTENECEN
            if (i < 3) {
                const club = document.createElement("div");
                club.innerHTML = pClub[i]
                document.getElementById("leaderboard").appendChild(div).childNodes[0].childNodes[1].appendChild(club);
            }
        }
    }
}

// LLAMA A LA FUNCION
firstRunner1()

// LLAMA A LA FUNCION
getFirebaseDataon()

//
function fRunner() {
    var y = 2412 / 3
    var time1Coordinate = 681
    if (raceStartTime) {
        if (firstRunner1 < checkPoints[1] * y + 9 && time <= reader1_Timings[0]) {
            firstRunner1 += 1;
        }
        if (firstRunner1 < checkPoints[1] * y && time >= reader1_Timings[0]) {
            firstRunner1 = checkPoints[1] * y
        }
        if (firstRunner1 < checkPoints[2] * y + 9 && time >= reader1_Timings[0] && time <= reader2_Timings[0]) {
            firstRunner1 += 2;
        }
        if (firstRunner1 < checkPoints[2] * y && time >= reader2_Timings[0]) {
            firstRunner1 = checkPoints[2] * y
        }

        if ((firstRunner1 <= checkPoints[3] * y - 10) && time >= reader2_Timings[0]) {
            firstRunner1 += 1;
        }
        if (time >= reader3_Timings[0]) {
            firstRunner1 = cell.length - 1
        }

        if (secondRunner1 <= checkPoints[1] * y) {
            secondRunner1 += .9
            if (time >= reader1_Timings[1]) {
                secondRunner1 = checkPoints[1] * y
            }
        }
        if (secondRunner1 <= checkPoints[2] * y && time >= reader1_Timings[1]) {
            secondRunner1 += 1.8
            if (time >= reader2_Timings[1]) {
                secondRunner1 = checkPoints[2] * y
            }
        }
        if ((secondRunner1 <= checkPoints[3] * y - 10) && time >= reader2_Timings[1]) {
            secondRunner1 += .9
        }
        if (time >= reader3_Timings[1]) {
            secondRunner1 = cell.length - 1
            finish2 = 30
        }
        if (thirdRunner1 <= checkPoints[1] * y - 20) {
            thirdRunner1 += .8
            if (time >= reader1_Timings[2]) {
                thirdRunner1 = checkPoints[1] * y
            }
        }
        if (thirdRunner1 <= checkPoints[2] * y - 20 && time >= reader1_Timings[2]) {
            thirdRunner1 += 1.6
            if (time >= reader2_Timings[2]) {
                thirdRunner1 = checkPoints[2] * y
            }
        }
        if ((thirdRunner1 <= checkPoints[3] * y - 10) && time >= reader2_Timings[2]) {
            thirdRunner1 += .8
        }
        if (time >= reader3_Timings[2]) {
            thirdRunner1 = cell.length - 1
            finish3 = -30
        }
        var dot_place = {
            1: firstRunner,
            2: secondRunner,
            3: thirdRunner,
            4: finish2,
            5: finish3,
            6: speed
        }
        window.sessionStorage.setItem("dot_place", JSON.stringify(dot_place));
    }
}

//
const render1 = setInterval(fRunner, (600000 / ((cell.length - 1) / 3)) / speed)

// 
if (time >= reader3_Timings[participants.length - 2]) { //change this
    clearInterval(render1)
    clearInterval(Timer);
    clearInterval(Timer1);
}