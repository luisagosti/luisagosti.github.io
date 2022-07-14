function activateSearchEngine() {
    var userInput = document.getElementById("searchZone").value
    document.getElementById('svgContainer').style.display = ""
    if (userInput === ""){
        document.getElementById("svgContainer").style.display = "none";
        return
    } else {
        document.getElementById("svgContainer").style.display = "";
    }
    var isRegex = false
    if (userInput.includes('*')) {
        isRegex = true
        var pattern = '\^' + userInput.replace(/\./g, "\\\.").replace(/\*/g, ".*").replace(/([\\ \+ \? \[ \^ \] \$ \( \) \{ \} \= \! \< \> \| \: \-])/g, "\\\$1") + '\$'
        var regex = new RegExp(pattern)
    }

    for (var i = 0; i < chords.guitarChords.length; i++) {
        var each = chords.guitarChords[i]
        if ((!isRegex && (userInput === each.firstName || userInput === each.alternateName || userInput === each.type))
          || (isRegex && (regex.test(each.firstName) || regex.test(each.alternateName) || regex.test(each.type)))) {
            document.getElementById('svg' + i).style.display = ""
        } else {
            document.getElementById('svg' + i).style.display = "none"
        }
    }
}

function reactToKeyboard(event) {
    var x = event.which || event.keyCode; 
}

function displaySpecificChords(input) {
    document.getElementById("searchZone").value = input
    activateSearchEngine()
}
