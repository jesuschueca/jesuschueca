// DECLARACION DE VARIABLES
var speed
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")
var firstRunner1 = 0
var secondRunner1 = 0
var thirdRunner1 = 0
var zoomFactor = 3.7
var xoffset = zoomFactor * 80 / 3.7
var yoffset = zoomFactor * 800 / 3.7
var startingPoint = yoffset / zoomFactor
var keys = []
var reader0 = []
var reader0sync = 0
var reader1sync = 0
var reader2sync = 0
var reader3sync = 0
var time1Coordinate = 747
var raceStartTime = 0
var reader1Inbox = []
var reader1_Timings = []
var readerPositions = []
var reader2Positions = []
var reader2Inbox = []
var reader2_Timings = []
var reader3Inbox = []
var reader3_Timings = []
var runnerdelays = []
var raceInfo
var participants
var pName = []
var pClub = []
var time
var Timer = setInterval(Time,500)
var finish2 = 0
var finish3 = 0
var cell = Coordinates
var time = 0
var Timer1 = setInterval(TimerFunction, 500)
circleSize = 10

// RECUPERA LA INFORMACIÓN DE LA PANTALLA DE "LEADERBOARD"
if (window.sessionStorage.getItem("dot_place")) {
    var dot_place = JSON.parse(window.sessionStorage.getItem("dot_place"))
    firstRunner1 = dot_place[1]
    secondRunner1 = dot_place[2]
    thirdRunner1 = dot_place[3]
    finish2 = dot_place[4]
    finish3 = dot_place[5]
    speed = dot_place[6]
}
else {
    firstRunner1 = 0
    secondRunner1 = 0
    thirdRunner1 = 0
    finish2 = 0
    finish3 = 0
    speed = 10
}

// OBTENER LOS DATOS DE LA CARRERA
firebase.database().ref('Data/01_RaceInfo').once('value', function (data) {
    raceInfo = data.val()
    document.getElementById("tDistance").innerHTML = raceInfo[3]["Distance"] + "km"
})

// OBTENER LOS DATOS DE LOS PARTICIPANTES
firebase.database().ref('Data/02_Participants').once('value', function (data) {
    participants = data.val()
})

// FUNCION QUE RECUPERA LA INFORMACION DE FIREBASE
function getFirebaseDataon() {
    firebase.database().ref('Data/03_Inbox').on('value', function (data) {
        keys = []
        reader0 = []
        reader1Inbox = []
        reader1_Timings = []
        readerPositions = []
        reader2Positions = []
        reader2Inbox = []
        reader2_Timings = []
        reader3Inbox = []
        reader3_Timings = []
        runnerdelays = []
        pName = []
        pClub = []
        inbox = data.val()

        //
        Object.keys(inbox).forEach((key) => {
            keys.push(key)
            if (inbox[key].includes("Reader 3")) {
                reader3Inbox.push(inbox[key])
            }
            if (inbox[key].includes("Reader 2")) {
                reader2Inbox.push(inbox[key])
            }
            if (inbox[key].includes("Reader 1")) {
                reader1Inbox.push(inbox[key])
            }
            if (inbox[key].includes("Reader 0")) {
                reader0.push(inbox[key])
            }
        })

        //
        arduino0 = parseInt(reader0[0].slice(22)) * 1000 + parseInt(reader0[0].slice(36))
        reader0sync = arduino0 + new Date("Mar 31, 1900").getTime()

        //
        arduino3 = parseInt(reader3Inbox[0].slice(22)) * 1000 + parseInt(reader3Inbox[0].slice(36))
        reader3sync = arduino3 + new Date("Mar 31, 1900").getTime()
        for (i = 1; i <= reader3Inbox.length - 1; i++) {
            let t = reader3Inbox[i].slice(21, 31)
            let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3])
            reader3_Timings.push(ms)
            readerPositions.push(parseInt(reader3Inbox[i].slice(-2)))
        }

        //
        arduino2 = parseInt(reader2Inbox[0].slice(22)) * 1000 + parseInt(reader2Inbox[0].slice(36))
        reader2sync = arduino2 + new Date("Mar 31, 1900").getTime()
        for (i = 1; i <= reader2Inbox.length - 1; i++) {
            let t = reader2Inbox[i].slice(21, 31)
            let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3]) - arduino3 + arduino2
            reader2_Timings.push(ms)
            readerPositions.push(parseInt(reader2Inbox[i].slice(-2)))
        }

        //
        arduino1 = parseInt(reader1Inbox[0].slice(22)) * 1000 + parseInt(reader1Inbox[0].slice(36))
        reader1sync = arduino1 + new Date("Mar 31, 1900").getTime()
        for (i = 1; i <= reader1Inbox.length - 1; i++) {
            let t = reader1Inbox[i].slice(21, 32)
            let ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000 + Number(t.split(':')[3]) - arduino3 + arduino1
            reader1_Timings.push(ms)
            readerPositions.push(parseInt(reader1Inbox[i].slice(-2)))
        }
        
        //
        for (i = 1; i < participants.length; i++) {
            readerPositions.push(i)
        }

        //
        let uniquePositions = []
        readerPositions.forEach((c) => {
            if (!uniquePositions.includes(c)) {
                uniquePositions.push(c)
                pName.push(participants[c]["Name"] + " " + participants[c]["Surname"])
                pClub.push(participants[c]["Club"])
            }
        })
        let t = reader0[1].slice(20, 30)

        // CALCULA LA DIFERENCIA DE TIEMPOS CON EL PRIMER CLASIFICADO
        runnerdelays.push(raceStartTime)
        for (i = 1; i < reader1_Timings.length; i++) {
            if (reader3_Timings[i]) {
                runnerdelays.push(reader3_Timings[i] - reader3_Timings[0])
            }
            else if (reader2_Timings[i]) {
                runnerdelays.push(reader2_Timings[i] - reader2_Timings[0])
            }
            else if (reader1_Timings[i]) {
                runnerdelays.push(reader1_Timings[i] - reader1_Timings[0])
            }

        }
    })
}

//
function getData() {
    raceStartTime = new Date().getTime()
    window.sessionStorage.setItem("raceStartTime", JSON.stringify(raceStartTime))
    document.getElementById("button").setAttribute("class", "hidden")
}

//
getFirebaseDataon()

//
if (window.sessionStorage.getItem("raceStartTime")) {
    raceStartTime = window.sessionStorage.getItem("raceStartTime")
    document.getElementById("button").setAttribute("class", "hidden")
}
else {
    document.getElementById("time").innerHTML = "La carrera no ha empezado"
    distance = 0
    document.getElementById("distance").innerHTML = distance.toFixed(2)
}

//
function Time() {
    now = new Date().getTime()
    if (raceStartTime) {
        time = (now - raceStartTime) * speed
    }
    else {
        time = 0
    }
}

//
Time()

//
function erraseCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

//
function fRunner() {
    erraseCanvas()
    var cell = Coordinates
    var y = cell.length / 3
    var i = 0
    ctx.moveTo((parseInt(cell[y * i]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[y * i]['y']) + yoffset) / zoomFactor)
    for (i = 0; i <= 2411; i++) {
        var cell = Coordinates[i]
        ctx.lineTo((parseInt(cell['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell['y']) + yoffset) / zoomFactor)
    }
    ctx.lineWidth = 3
    ctx.stroke()
    var cell = Coordinates
    checkPoints = [0, 1, 2, 3]
    var y = cell.length / 3
    var i = checkPoints[0]
    ctx.beginPath()
    ctx.arc((parseInt(cell[y * i]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[y * i]['y']) + yoffset) / zoomFactor, circleSize, 0, 2 * Math.PI)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "black"
    ctx.font = "20px Arial"
    ctx.fillText("SALIDA", (parseInt(cell[y * i]['x']) + xoffset) / zoomFactor - 13, 580 - (parseInt(cell[y * i]['y']) + yoffset) / zoomFactor + 30)

    // PUNTO DE CONTROL 1
    i = checkPoints[1]
    ctx.beginPath()
    ctx.arc((parseInt(cell[y * i]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[y * i]['y']) + yoffset) / zoomFactor, circleSize, 0, 2 * Math.PI)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "black"
    ctx.font = "20px Arial"
    ctx.fillText("CHECKPOINT 1", (parseInt(cell[y * i]['x']) + xoffset) / zoomFactor - 100, 580 - (parseInt(cell[y * i]['y']) + yoffset + 30) / zoomFactor + 5)

    // PUNTO DE CONTROL 2
    i = checkPoints[2]
    ctx.beginPath()
    ctx.arc((parseInt(cell[y * i]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[y * i]['y']) + yoffset) / zoomFactor, circleSize, 0, 2 * Math.PI)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "black"
    ctx.font = "20px Arial"
    ctx.fillText("CHECKPOINT 2", (parseInt(cell[y * i]['x']) + xoffset) / zoomFactor + 20, 580 - (parseInt(cell[y * i]['y']) + yoffset + 20) / zoomFactor + 5)

    // PUNTO DE CONTROL 3
    i = checkPoints[3]
    ctx.beginPath()
    ctx.arc((parseInt(cell[cell.length - 1]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[cell.length - 1]['y']) + yoffset) / zoomFactor, circleSize, 0, 2 * Math.PI)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "black"
    ctx.font = "20px Arial"
    ctx.fillText("META", (parseInt(cell[cell.length - 1]['x']) + xoffset) / zoomFactor - 50, 580 - (parseInt(cell[cell.length - 1]['y']) + yoffset) / zoomFactor + 30)

    ctx.stroke()

    //
    if (raceStartTime) {
        if (firstRunner1 < checkPoints[1] * y + 9) {
            firstRunner1 += 1
            distanceFlag = true
            console.log("hello")
        }
        if (firstRunner1 < checkPoints[1] * y && time >= reader1_Timings[0]) {
            firstRunner1 = checkPoints[1] * y
            distanceFlag = false
        }
        if (firstRunner1 < checkPoints[2] * y + 9 && time >= reader1_Timings[0] && time <= reader2_Timings[0]) {
            firstRunner1 += 2
            distanceFlag = true
        }
        if (firstRunner1 < checkPoints[2] * y && time >= reader2_Timings[0]) {
            firstRunner1 = checkPoints[2] * y
            distanceFlag = false
        }
        if ((firstRunner1 <= checkPoints[3] * y - 10) && time >= reader2_Timings[0]) {
            firstRunner1 += 1
            distanceFlag = true
        }
        if (time >= reader3_Timings[0]) {
            firstRunner1 = cell.length - 1
            distanceFlag = false
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
            1: firstRunner1,
            2: secondRunner1,
            3: thirdRunner1,
            4: finish2,
            5: finish3,
            6: speed
        }
        window.sessionStorage.setItem("dot_place", JSON.stringify(dot_place))
    }

    //
    firstRunner = Math.floor(firstRunner1)
    secondRunner = Math.floor(secondRunner1)
    thirdRunner = Math.floor(thirdRunner1)

    // DEFINICION PUNTO 3
    ctx.beginPath()
    ctx.arc((parseInt(cell[thirdRunner]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[thirdRunner]['y']) + yoffset + finish3) / zoomFactor, 10, 0, 2 * Math.PI)
    ctx.lineWidth = 1
    ctx.fillStyle = "blue"
    ctx.fill()
    ctx.stroke()
    ctx.beginPath();
    ctx.font = "15px Arial"
    ctx.fillStyle = "white"
    ctx.fillText("3", (parseInt(cell[thirdRunner]['x']) + xoffset) / zoomFactor - 4, 580 - (parseInt(cell[thirdRunner]['y']) + yoffset + finish3) / zoomFactor + 4)

    // DEFINICION PUNTO 2
    ctx.beginPath()
    ctx.arc((parseInt(cell[secondRunner]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[secondRunner]['y']) + yoffset + finish2) / zoomFactor, 10, 0, 2 * Math.PI)
    ctx.lineWidth = 1
    ctx.fillStyle = "blue"
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.font = "15px Arial"
    ctx.fillStyle = "white"
    ctx.fillText("2", (parseInt(cell[secondRunner]['x']) + xoffset) / zoomFactor - 4, 580 - (parseInt(cell[secondRunner]['y']) + yoffset + finish2) / zoomFactor + 4)

    // DEFINICION PUNTO 1
    ctx.beginPath()
    ctx.arc((parseInt(cell[firstRunner]['x']) + xoffset) / zoomFactor, 580 - (parseInt(cell[firstRunner]['y']) + yoffset) / zoomFactor, 10, 0, 2 * Math.PI)
    ctx.lineWidth = 1
    ctx.fillStyle = "blue"
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.font = "15px Arial"
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.fillText("1", (parseInt(cell[firstRunner]['x']) + xoffset) / zoomFactor - 4, 580 - (parseInt(cell[firstRunner]['y']) + yoffset) / zoomFactor + 4)
}

//
fRunner()
const render1 = setInterval(fRunner, (600000 / ((cell.length - 1) / 3)) / speed)
console.log((600000 / ((cell.length - 1) / 3)) / speed)
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}

//
function minutestomillis(time) {
    time = time.toString()
    var timeParts = time.split(":")
    return ((+timeParts[0] * (60000)) + (timeParts[1] ? +timeParts[1] * 1000 : +0))
}

//
function TimerFunction() {
    // EN CASO DE QUE SE HAYA ACABADO LA CARRERA, PONER LOS DATOS FINALES
    if (time >= reader3_Timings[participants.length - 2]) {
        clearInterval(render1)
        clearInterval(Timer)
        clearInterval(Timer1)
        //document.getElementById("expected").innerHTML = "CARRERA FINALIZADA";
        document.getElementById("expected").innerHTML = ""
        document.getElementById("thanExpected").innerHTML = ""
        time = reader3_Timings[participants.length - 2]
        document.getElementById("time").innerHTML = millisToMinutesAndSeconds(time)
        distance = 5
        document.getElementById("distance").innerHTML = distance.toFixed(2)
    }

    //
    else if (raceStartTime) {
        var expected;
        var sign = false;
        if (time >= reader3_Timings[0]) {
            expected = minutestomillis(raceInfo[3]["ExpectedTime"]) - (reader3_Timings[0])
        }
        else if (time >= reader2_Timings[0]) {
            expected = minutestomillis(raceInfo[2]["ExpectedTime"]) - (reader2_Timings[0])
        }
        else if (time >= reader1_Timings[0]) {
            expected = minutestomillis(raceInfo[1]["ExpectedTime"]) - (reader1_Timings[0])
        }
        else {
            expected = 0;
        }
        if (expected < 0) {
            sign = true;
        } 
        var expected = Math.abs(expected)
        expectedTime = millisToMinutesAndSeconds(expected)
        if (raceStartTime) {
            document.getElementById("expected").innerHTML = (sign ? "+" : "-") + expectedTime;
            document.getElementById("thanExpected").innerHTML = "DE LO ESPERADO"
        }
        if (time > reader3_Timings[0]) {
            distance = 5
        }
        if(distanceFlag) {
            distance = raceInfo[3]["Distance"] * ((time + expected)/ 60000) / raceInfo[3]["ExpectedTime"]
        }
        document.getElementById("distance").innerHTML = distance.toFixed(2);
        document.getElementById("tDistance").innerHTML = raceInfo[3]["Distance"] + "km";

        if (raceStartTime) {
            document.getElementById("time").innerHTML = millisToMinutesAndSeconds(time);
        }
    }
}

fRunner()