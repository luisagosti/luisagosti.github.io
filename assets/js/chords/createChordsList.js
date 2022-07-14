function loadJsonFile(url) {
    var result = null
    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, false)
    xhr.send()
    if (xhr.readyState == 4) {
        document.getElementById('svgContainer').style.display = "none"
        result = JSON.parse(xhr.responseText)
    }
    return result
}

function drawSvg(shape, attributes) {
    var result = document.createElementNS(ns, shape)
    for (var each in attributes) {
        result.setAttributeNS(null, each, attributes[each])
    }
    return result
}

function drawSvgText(attributes, text) {
    var result = drawSvg('text', attributes)
    result.appendChild(document.createTextNode(text))
    return result
}

function drawSvgNotePlayed(attributes, note, accident=null) {
    var result = drawSvgText(attributes, note)
    if (accident) {
        var tspan = document.createElementNS(ns, 'tspan')
        tspan.setAttributeNS(null, 'style', 'font:8px sans-serif')
        tspan.setAttributeNS(null, 'dy', -3.75)
        tspan.appendChild(document.createTextNode(accident))
        result.appendChild(tspan)
    }
    return result
}

function drawSvgChordName(attributes, name, alternateName=null) {
    var result = drawSvgText(attributes, name)
    if (alternateName) {
        var tspan = document.createElementNS(ns, 'tspan')
        tspan.setAttributeNS(null, 'style', 'font:12px sans-serif')
        tspan.setAttributeNS(null, 'alignment-baseline', "middle")
        tspan.appendChild(document.createTextNode(' or '))
        result.appendChild(tspan)
        var tspan2 = document.createElementNS(ns, 'tspan')
        tspan2.setAttributeNS(null, 'style', 'font:bold 14px sans-serif')
        tspan2.setAttributeNS(null, 'alignment-baseline', "middle")
        tspan2.appendChild(document.createTextNode(alternateName))
        result.appendChild(tspan2)
    }
    return result
}

var ns = 'http://www.w3.org/2000/svg'

var radius = 0.5 * 2.5 * Math.min(15, 25) / 3.75

var guitarStrings = ['E', 'A', 'D', 'G', 'B', 'E']
var notes = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#']
var stringNotes = [7, 0, 5, 10, 2, 7] 

function treble(guitarString, finger) {
    var stringNote = stringNotes[guitarString]
    return notes[(stringNote + finger) % notes.length]
 }

function getMaxFinger(guitarChord) {
    result = 0
    for (var i = 0; i < guitarStrings.length; i++) {
        var finger = guitarChord.fingers[i]
        if (result < finger && finger != 'x') {
            result = finger
        }
    }
    return result
}

function getMinFinger(guitarChord) {
    result = +Infinity
    for (var i = 0; i < guitarStrings.length; i++) {
        var finger = guitarChord.fingers[i]
        if (0 < finger && finger < result  && finger != 'x') {
            result = finger
        }
    }
    return result
}

function getFirstDisplayedFret(guitarChord, numberOfDisplayedFrets) {
    if (getMaxFinger(guitarChord) <= numberOfDisplayedFrets) {
        return 1
    }
    else {
        return getMinFinger(guitarChord)
    }
}

function createSvgChord(guitarChord, uniqueId) {
    var svgGlob = createSvgGlob(uniqueId)
    var svgTop = createSvgTop(svgGlob)
    var svgBottom = createSvgBottom(svgGlob)

    drawChordName(svgTop, uniqueId, guitarChord)
    drawShaft(svgBottom)
    drawChord(svgBottom, guitarChord)

    return svgGlob
}

function drawChord(svg, guitarChord) {
    var firstDisplayedFret = getFirstDisplayedFret(guitarChord, 5)
    drawFirstDisplayedFret(svg, firstDisplayedFret)
    for (var i = 0; i < guitarStrings.length; i++)
    {
        var finger = guitarChord.fingers[i]
        if (finger == 'x') {
            drawNotPlayedString(svg, i)
        }
        else {
            drawPlayedString(svg, i)
            drawFinger(svg, i, finger, firstDisplayedFret)
            drawPlayedNote(svg, i, finger)
        }
    }
}

function createSvgGlob(uniqueId) {
    var svgGlob = drawSvg('svg', {id:'svg'+uniqueId, width:155 + 7.5, height:250  + 7.5})
    svgGlob.appendChild(drawSvg('rect', {x:7.5 / 2, y:7.5 / 2, width:155, height:250 , fill:"var(--body-color)", visibility: "hidden" , stroke:'none', 'stroke-width':1}))
    return svgGlob
}

function createSvgTop(svgGlob) {
    var svgTop = drawSvg('svg', {x:7.5 / 2, y:7.5 / 2, width:155, height:50})
    svgGlob.appendChild(svgTop)
    return svgTop
}

function createSvgBottom(svgGlob) {
    var svgBottom = drawSvg('svg', {x:7.5 / 2, y:50, width:155, height:250  - 50})
    svgGlob.appendChild(svgBottom)
    return svgBottom
}

function drawShaft(svg) {
    svg.appendChild(drawSvg('rect', {x:37.5, y:37.5 - 7, width:(6 - 1) * 15, height:7, fill:'var(--body-color)', visibility: "hidden", stroke:'var(--title-color)'}))
    svg.appendChild(drawSvg('rect', {x:37.5, y:37.5, width:(6 - 1) * 15, height:(6 - 1) * 25, fill:'var(--body-color)',visibility: "hidden", stroke:'var(--body-color)'}))
    for (var i = 0; i < 6; i++) {
        svg.appendChild(drawSvg('line', {x1:37.5, y1:37.5 + i * 25, x2:37.5 + (6 - 1) * 15, y2:37.5 + i * 25, stroke:'var(--title-color)'}))
    }
    for (var i = 0; i < guitarStrings.length; i++)
    {
        svg.appendChild(drawSvgText({x:37.5 - 3.75 + i * 15, y:37.5 / 2 + 3.75, fill:'var(--text-color)', style:'font:12px sans-serif'}, guitarStrings[i]))
    }
}

function drawChordName(svg, uniqueId, guitarChord) {
    svg.appendChild(drawSvgChordName({id:'name'+uniqueId, x:'50%', y:'50%', fill:'var(--title-color)', 'alignment-baseline':"middle", 'text-anchor':"middle", style:'font:bold 14px sans-serif'}, guitarChord.firstName, guitarChord.alternateName))
}

function drawFirstDisplayedFret(svg, firstDisplayedFret) {
    if (firstDisplayedFret > 1) {
        svg.appendChild(drawSvgText({x:7.5 + 7.5 / 2, y:37.5 - 25 / 2 + 25, 'alignment-baseline':"middle", style:'font:12px sans-serif', fill:'var(--title-color)'}, firstDisplayedFret + 'fr'))
    }
}

function drawNotPlayedString(svg, i) {
    svg.appendChild(drawSvgText({x:37.5 + i * 15, y:37.5, 'text-anchor':"middle", fill:'rgb(238, 0, 0)' , style:'font:bold 14px sans-serif'}, 'x'))
    svg.appendChild(drawSvg('line', {x1:37.5 + i * 15, y1:37.5, x2:37.5 + i * 15, y2:37.5 + (6 - 1) * 25, stroke:'rgb(238, 0, 0)' , 'stroke-dasharray':'2,3'}))
}

function drawPlayedString(svg, i) {
    svg.appendChild(drawSvg('line', {x1:37.5 + i * 15, y1:37.5, x2:37.5 + i * 15, y2:37.5 + (6 - 1) * 25, stroke:'var(--title-color)'}))
}

function drawFinger(svg, i, finger, firstDisplayedFret) {
    var displayedFinger = finger
    if (firstDisplayedFret > 1) {
        displayedFinger -= (firstDisplayedFret - 1)
    }
    if (displayedFinger >= 1) {
        svg.appendChild(drawSvg('circle', {cx:37.5 + i * 15, cy:37.5 - 25 / 2 + displayedFinger * 25, r:radius, fill:'var(--title-color)'}))
    } 
}

function drawPlayedNote(svg, i, finger) {
    var playedNote = treble(i, finger)
    svg.appendChild(drawSvgNotePlayed({x:37.5 - 3.75 + i * 15, y:37.5 + (6 - 1) * 25 + 37.5 / 2, style:'font:12px sans-serif', fill:'var(--title-color)'}, playedNote[0], (playedNote.length == 2) ? playedNote[1] : null))
}

var url = "https://firebasestorage.googleapis.com/v0/b/easytab-1733c.appspot.com/o/JSON%2FguitarChordDictionary.json?alt=media&token=727f5267-24ef-4bf1-a098-e1010f7ca9a6n"
var chords = loadJsonFile(url)

var svgContainer = document.getElementById('svgContainer')

var uniqueId = 0
for (var each of chords.guitarChords) {
    var svgChord = createSvgChord(each, uniqueId++)
    svgContainer.appendChild(svgChord)
}
