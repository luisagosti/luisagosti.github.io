//-------------------------Firebase-----------------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';
import { getStorage, ref, getDownloadURL, listAll } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6SdxUWyBURpof-k_A2jZUxb8QNb69YDg",
  authDomain: "easytab-1733c.firebaseapp.com",
  projectId: "easytab-1733c",
  storageBucket: "easytab-1733c.appspot.com",
  messagingSenderId: "893840038809",
  appId: "1:893840038809:web:bf81136b27d90add9c9108",
  measurementId: "G-VDBGDQ2PKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

var dbSearchName = '';

const storage = getStorage();

navigator.mediaDevices.getUserMedia({
  audio: true
})
  .then(function (stream) {

  })
  .catch(function (err) {
    console.log(err);
  });

document.getElementById("sk-chase").style.display = 'hidden'

class likesArray {
  constructor(likes) {
    this.likes = likes
  }
  toString() {
    return this.likes;
  }
}

// Firestore data converter
const convertLikesArray = {
  toFirestore: (likesArray) => {
    return {
      likes: likesArray.likes,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new likesArray(data.likes);
  }
};

// Check if user is logged in
const auth = getAuth();

// Find all the prefixes and items.
const listRef = ref(storage, 'tabs');
var sel = document.getElementById("musicList")

var songsTeste = [];


// Populate datalist
listAll(listRef)
  .then((res) => {
    res.items.forEach((itemRef) => {
      let opt = document.createElement('option');
      opt.innerHTML += itemRef.name.slice(0, -4)
      sel.appendChild(opt);
      songsTeste += ', ' + itemRef.name.slice(0, -4)
    });
    let songsTesteSliced = songsTeste.slice(2)

    onAuthStateChanged(auth, async (user) => {

      if (user) {

        document.getElementById("menuLogin").href = 'userPage.html';
        document.getElementById('contact').style.display = "none"
        document.getElementById('like').style.display = ""

        class userInfo {
          constructor(userEmail, userName, userPass) {
            this.userEmail = userEmail;
            this.userName = userName;
            this.userPass = userPass;
          }
          toString() {
            return this.userEmail + ', ' + this.userName + ', ' + this.userPass;
          }
        }


        // Firestore data converter
        const userInfoConverter = {
          toFirestore: (userInfo) => {
            return {
              userEmail: userInfo.userEmail,
              userName: userInfo.userName,
              userPass: userInfo.userPass
            };
          },
          fromFirestore: (snapshot, options) => {
            const data = snapshot.data(options);
            document.getElementById('menuLogin').textContent = data.userName;
            return new userInfo(data.userEmail, data.userName, data.userPass);
          }
        };

        const ref2 = doc(db, "users", user.email).withConverter(userInfoConverter);
        const docSnap2 = await getDoc(ref2);
        docSnap2.data();

        // ============================ ALPHATAB ====================================
        var teste = document.getElementById("at-main")
        var teste2 = teste.innerHTML
        var listLengthValue = document.getElementsByName("getMusic")[0];

        if (localStorage.getItem("storageName")) {
          document.getElementById("searchBar").value = localStorage.getItem("storageName")
          setTimeout(function () {
            document.getElementById("ri-search-line").click();
          }, 500)
          window.localStorage.clear();
        }
        document.getElementById("searchBar").addEventListener("keyup", function (e) {
          if (e.key === 'Enter') {
            document.getElementById("ri-search-line").click();
          }
        });

        document.getElementById("ri-search-line").addEventListener('click', async function () {

          if (songsTesteSliced.includes(listLengthValue.value) && listLengthValue.value) {
            teste.innerHTML = teste2 // Refresh at-main

            var searchBar = document.getElementById('searchBar').value;

            const ref = doc(db, "users", user.email).withConverter(convertLikesArray);
            const docSnap = await getDoc(ref);

            if (docSnap.exists()) {

              const likesArray = docSnap.data();


              // ================ LIKE BUTTON =================
              var listLength = document.getElementsByName("getMusic")[0]; // Musica escolhida
              var likeButton = document.getElementById('like');


              if (likesArray.toString().includes(listLength.value)) {
                likeButton.classList.toggle('is-liked')
              }

              likeButton.addEventListener('click', () => {
                likeButton.classList.toggle('is-liked')
                likeButton.style.pointerEvents = 'none'
                setTimeout(function () {
                  likeButton.style.pointerEvents = 'all'
                }, 3000)
              });

              likeButton.addEventListener('click', async (event) => {

                if (event.target.classList.contains('is-liked')) {

                  try {

                    await updateDoc(ref, {
                      likes: arrayUnion(listLength.value)
                    });

                    var x = document.getElementById("addedLike");
                    x.innerHTML = "Adicionado aos likes";
                    x.classList.add("show");

                    setTimeout(function () {
                      x.className = x.className.replace("show", "");
                    }, 3000);

                  } catch (error) {

                    x.innerHTML = error;
                    x.classList.add("show");

                    setTimeout(function () {
                      x.className = x.className.replace("show", "");
                    }, 3000);

                  }

                } else {

                  try {

                    await updateDoc(ref, {
                      likes: arrayRemove(listLength.value)
                    });

                    var y = document.getElementById("removeLike");
                    y.innerHTML = "Removido dos likes";
                    y.classList.add("show");
                    setTimeout(function () {
                      y.className = y.className.replace("show", "");
                    }, 3000);

                  } catch (error) {

                    y.innerHTML = error;
                    y.classList.add("show");

                    setTimeout(function () {
                      y.className = y.className.replace("show", "");
                    }, 3000);
                  }

                }

              })

            } else {
              console.log("No such document!");
            }

            listAll(listRef)
              .then((res) => {
                res.items.forEach((itemRef) => {

                  if (itemRef.name.slice(0, -4) == searchBar) {

                    dbSearchName = itemRef.name;

                  }

                });
                handleSomething(dbSearchName);
              }).catch((error) => {
                console.log(error)
              });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Essa musica não se encontra presente na lista. Experimenta escolher uma das que te são apresentadas.',
            })
          }
        })

        function handleSomething(musicSearch) {

          // load elements
          const wrapper = document.querySelector(".at-wrap");
          const main = wrapper.querySelector(".at-main");


          getDownloadURL(ref(storage, `tabs/${musicSearch}`))
            .then((url) => {

              // initialize alphatab

              const settings = {
                file: url,
                player: {
                  enablePlayer: true,
                  soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2",
                  scrollElement: wrapper.querySelector('.at-viewport')
                },
              };
              const api = new alphaTab.AlphaTabApi(main, settings);


              // overlay logic

              const overlay = wrapper.querySelector(".at-overlay");
              api.renderStarted.on(() => {
                overlay.style.display = "flex";
                document.getElementById("sk-chase").style.display = 'flex'
              });
              api.renderFinished.on(() => {
                overlay.style.display = "none";
                musicSearch = ''
                document.getElementById("sk-chase").style.display = 'none'
              });




              // track selector
              function createTrackItem(track) {
                const trackItem = document
                  .querySelector("#at-track-template")
                  .content.cloneNode(true).firstElementChild;
                trackItem.querySelector(".at-track-name").innerText = track.name;
                trackItem.track = track;
                trackItem.onclick = (e) => {
                  e.stopPropagation();
                  api.renderTracks([track]);
                };
                return trackItem;
              }


              const trackList = wrapper.querySelector(".at-track-list");


              api.scoreLoaded.on((score) => {
                // clear items

                trackList.innerHTML = "";
                // generate a track item for all tracks of the score
                score.tracks.forEach((track) => {
                  trackList.appendChild(createTrackItem(track));
                });
              });


              api.renderStarted.on(() => {
                // collect tracks being rendered
                const tracks = new Map();
                api.tracks.forEach((t) => {
                  tracks.set(t.index, t);
                });
                // mark the item as active or not
                const trackItems = trackList.querySelectorAll(".at-track");
                trackItems.forEach((trackItem) => {
                  if (tracks.has(trackItem.track.index)) {
                    trackItem.classList.add("active");
                  } else {
                    trackItem.classList.remove("active");
                  }
                });
              });


              /** Controls **/
              api.scoreLoaded.on((score) => {
                wrapper.querySelector(".at-song-title").innerText = score.title;
                wrapper.querySelector(".at-song-artist").innerText = score.artist;
              });


              const countIn = wrapper.querySelector('.at-controls .at-count-in');
              countIn.onclick = () => {
                countIn.classList.toggle('active');
                if (countIn.classList.contains('active')) {
                  api.countInVolume = 1;
                } else {
                  api.countInVolume = 0;
                }
              };


              const metronome = wrapper.querySelector(".at-controls .at-metronome");
              metronome.onclick = () => {
                metronome.classList.toggle("active");
                if (metronome.classList.contains("active")) {
                  api.metronomeVolume = 1;
                } else {
                  api.metronomeVolume = 0;
                }
              };


              const loop = wrapper.querySelector(".at-controls .at-loop");
              loop.onclick = () => {
                loop.classList.toggle("active");
                api.isLooping = loop.classList.contains("active");
              };


              wrapper.querySelector(".at-controls .at-print").onclick = () => {
                api.print();
              };


              const zoom = wrapper.querySelector(".at-controls .at-zoom select");


              zoom.onchange = () => {
                const zoomLevel = parseInt(zoom.value) / 100;
                api.settings.display.scale = zoomLevel;
                api.updateSettings();
                api.render();
              };

              const layout = wrapper.querySelector(".at-controls .at-layout select");


              layout.onchange = () => {
                switch (layout.value) {
                  case "horizontal":
                    api.settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    break;
                  case "page":
                    api.settings.display.layoutMode = alphaTab.LayoutMode.Page;
                    break;
                }
                api.updateSettings();
                api.render();
              };


              // player loading indicator
              const playerIndicator = wrapper.querySelector(
                ".at-controls .at-player-progress"
              );
              api.soundFontLoad.on((e) => {
                const percentage = Math.floor((e.loaded / e.total) * 100);
                playerIndicator.innerText = percentage + "%";
              });
              api.playerReady.on(() => {
                playerIndicator.style.display = "none";
              });


              // main player controls
              const playPause = wrapper.querySelector(
                ".at-controls .at-player-play-pause"
              );
              const stop = wrapper.querySelector(".at-controls .at-player-stop");
              playPause.onclick = (e) => {
                if (e.target.classList.contains("disabled")) {
                  return;
                }
                api.playPause();
              };
              stop.onclick = (e) => {
                if (e.target.classList.contains("disabled")) {
                  return;
                }
                api.stop();
              };
              api.playerReady.on(() => {
                playPause.classList.remove("disabled");
                stop.classList.remove("disabled");
              });
              api.playerStateChanged.on((e) => {
                const icon = playPause.querySelector("i.fas");
                if (e.state === alphaTab.synth.PlayerState.Playing) {
                  icon.classList.remove("fa-play");
                  icon.classList.add("fa-pause");
                } else {
                  icon.classList.remove("fa-pause");
                  icon.classList.add("fa-play");
                }
              });


              // song position
              function formatDuration(milliseconds) {
                let seconds = milliseconds / 1000;
                const minutes = (seconds / 60) | 0;
                seconds = (seconds - minutes * 60) | 0;
                return (
                  String(minutes).padStart(2, "0") +
                  ":" +
                  String(seconds).padStart(2, "0")
                );
              }


              const songPosition = wrapper.querySelector(".at-song-position");
              let previousTime = -1;
              api.playerPositionChanged.on((e) => {
                // reduce number of UI updates to second changes.
                const currentSeconds = (e.currentTime / 1000) | 0;
                if (currentSeconds == previousTime) {
                  return;
                }

                songPosition.innerText =
                  formatDuration(e.currentTime) + " / " + formatDuration(e.endTime);
              });

              api.renderFinished.on(() => {
                musicSearch = ''
              });



            })
            .catch((error) => {
              switch (error.code) {
                case 'storage/object-not-found':
                  // File doesn't exist
                  break;
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;

                // ...

                case 'storage/unknown':
                  // Unknown error occurred, inspect the server response
                  break;
              }
            });
        }

      } else {
        // User is signed out

        document.getElementById('menuLogin').textContent = 'Login';
        document.getElementById("menuLogin").href = '#contact';
        document.getElementById('contact').style.display = "visible"

        // ============================ ALPHATAB ====================================
        var teste = document.getElementById("at-main")
        var teste2 = teste.innerHTML
        var listLengthValue = document.getElementsByName("getMusic")[0];

        document.getElementById("searchBar").addEventListener("keyup", function (e) {
          if (e.key === 'Enter') {
            document.getElementById("ri-search-line").click();
          }
        });
        document.getElementById('ri-search-line').addEventListener('click', async function () {

          if (songsTesteSliced.includes(listLengthValue.value) && listLengthValue.value) {
            teste.innerHTML = teste2 // Refresh at-main

            var searchBar = document.getElementById('searchBar').value;

            // Like button fica aqui

            document.getElementById('like').addEventListener('click', () => {
              Swal.fire('Gostavas de puder dar like nas musicas?', 'Experimenta iniciar sessão', 'question')
            })

            listAll(listRef)
              .then((res) => {
                res.items.forEach((itemRef) => {

                  if (itemRef.name.slice(0, -4) == searchBar) {

                    dbSearchName = itemRef.name;

                  }

                });
                handleSomething(dbSearchName);
              }).catch((error) => {
                console.log(error)
              });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Essa musica não se encontra presente na lista. Experimenta escolher uma das que te são apresentadas.',
            })
          }
        })

        function handleSomething(musicSearch) {

          // load elements
          const wrapper = document.querySelector(".at-wrap");
          const main = wrapper.querySelector(".at-main");


          getDownloadURL(ref(storage, `tabs/${musicSearch}`))
            .then((url) => {

              // initialize alphatab

              const settings = {
                file: url,
                player: {
                  enablePlayer: true,
                  soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2",
                  scrollElement: wrapper.querySelector('.at-viewport')
                },
              };
              const api = new alphaTab.AlphaTabApi(main, settings);


              // overlay logic

              const overlay = wrapper.querySelector(".at-overlay");
              api.renderStarted.on(() => {
                overlay.style.display = "flex";
              });
              api.renderFinished.on(() => {
                overlay.style.display = "none";

              });




              // track selector
              function createTrackItem(track) {
                const trackItem = document
                  .querySelector("#at-track-template")
                  .content.cloneNode(true).firstElementChild;
                trackItem.querySelector(".at-track-name").innerText = track.name;
                trackItem.track = track;
                trackItem.onclick = (e) => {
                  e.stopPropagation();
                  api.renderTracks([track]);
                };
                return trackItem;
              }


              const trackList = wrapper.querySelector(".at-track-list");


              api.scoreLoaded.on((score) => {
                // clear items

                trackList.innerHTML = "";
                // generate a track item for all tracks of the score
                score.tracks.forEach((track) => {
                  trackList.appendChild(createTrackItem(track));
                });
              });


              api.renderStarted.on(() => {
                // collect tracks being rendered
                const tracks = new Map();
                api.tracks.forEach((t) => {
                  tracks.set(t.index, t);
                });
                // mark the item as active or not
                const trackItems = trackList.querySelectorAll(".at-track");
                trackItems.forEach((trackItem) => {
                  if (tracks.has(trackItem.track.index)) {
                    trackItem.classList.add("active");
                  } else {
                    trackItem.classList.remove("active");
                  }
                });
              });


              /** Controls **/
              api.scoreLoaded.on((score) => {
                wrapper.querySelector(".at-song-title").innerText = score.title;
                wrapper.querySelector(".at-song-artist").innerText = score.artist;
              });


              const countIn = wrapper.querySelector('.at-controls .at-count-in');
              countIn.onclick = () => {
                countIn.classList.toggle('active');
                if (countIn.classList.contains('active')) {
                  api.countInVolume = 1;
                } else {
                  api.countInVolume = 0;
                }
              };


              const metronome = wrapper.querySelector(".at-controls .at-metronome");
              metronome.onclick = () => {
                metronome.classList.toggle("active");
                if (metronome.classList.contains("active")) {
                  api.metronomeVolume = 1;
                } else {
                  api.metronomeVolume = 0;
                }
              };


              const loop = wrapper.querySelector(".at-controls .at-loop");
              loop.onclick = () => {
                loop.classList.toggle("active");
                api.isLooping = loop.classList.contains("active");
              };


              wrapper.querySelector(".at-controls .at-print").onclick = () => {
                api.print();
              };


              const zoom = wrapper.querySelector(".at-controls .at-zoom select");


              zoom.onchange = () => {
                const zoomLevel = parseInt(zoom.value) / 100;
                api.settings.display.scale = zoomLevel;
                api.updateSettings();
                api.render();
              };

              const layout = wrapper.querySelector(".at-controls .at-layout select");


              layout.onchange = () => {
                switch (layout.value) {
                  case "horizontal":
                    api.settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    break;
                  case "page":
                    api.settings.display.layoutMode = alphaTab.LayoutMode.Page;
                    break;
                }
                api.updateSettings();
                api.render();
              };


              // player loading indicator
              const playerIndicator = wrapper.querySelector(
                ".at-controls .at-player-progress"
              );
              api.soundFontLoad.on((e) => {
                const percentage = Math.floor((e.loaded / e.total) * 100);
                playerIndicator.innerText = percentage + "%";
              });
              api.playerReady.on(() => {
                playerIndicator.style.display = "none";
              });


              // main player controls
              const playPause = wrapper.querySelector(
                ".at-controls .at-player-play-pause"
              );
              const stop = wrapper.querySelector(".at-controls .at-player-stop");
              playPause.onclick = (e) => {
                if (e.target.classList.contains("disabled")) {
                  return;
                }
                api.playPause();
              };
              stop.onclick = (e) => {
                if (e.target.classList.contains("disabled")) {
                  return;
                }
                api.stop();
              };
              api.playerReady.on(() => {
                playPause.classList.remove("disabled");
                stop.classList.remove("disabled");
              });
              api.playerStateChanged.on((e) => {
                const icon = playPause.querySelector("i.fas");
                if (e.state === alphaTab.synth.PlayerState.Playing) {
                  icon.classList.remove("fa-play");
                  icon.classList.add("fa-pause");
                } else {
                  icon.classList.remove("fa-pause");
                  icon.classList.add("fa-play");
                }
              });


              // song position
              function formatDuration(milliseconds) {
                let seconds = milliseconds / 1000;
                const minutes = (seconds / 60) | 0;
                seconds = (seconds - minutes * 60) | 0;
                return (
                  String(minutes).padStart(2, "0") +
                  ":" +
                  String(seconds).padStart(2, "0")
                );
              }


              const songPosition = wrapper.querySelector(".at-song-position");
              let previousTime = -1;
              api.playerPositionChanged.on((e) => {
                // reduce number of UI updates to second changes.
                const currentSeconds = (e.currentTime / 1000) | 0;
                if (currentSeconds == previousTime) {
                  return;
                }

                songPosition.innerText =
                  formatDuration(e.currentTime) + " / " + formatDuration(e.endTime);
              });



            })
            .catch((error) => {
              switch (error.code) {
                case 'storage/object-not-found':
                  // File doesn't exist
                  break;
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;

                // ...

                case 'storage/unknown':
                  // Unknown error occurred, inspect the server response
                  break;
              }
            });
        }

      }
    });

  }).catch((error) => {
    console.log(error)
  });



// =======================TOOLTIP=========================
class Tooltip extends HTMLElement {
  connectedCallback() {
    this.setup();
  }

  handleDropdownPosition() {
    const screenPadding = 16;

    const placeholderRect = this.placeholder.getBoundingClientRect();
    const dropdownRect = this.dropdown.getBoundingClientRect();

    const dropdownRightX = dropdownRect.x + dropdownRect.width;
    const placeholderRightX = placeholderRect.x + placeholderRect.width;

    if (dropdownRect.x < 0) {
      this.dropdown.style.left = '0';
      this.dropdown.style.right = 'auto';
      this.dropdown.style.transform = `translateX(${-placeholderRect.x + screenPadding}px)`;
    } else if (dropdownRightX > window.outerWidth) {
      this.dropdown.style.left = 'auto';
      this.dropdown.style.right = '0';
      this.dropdown.style.transform = `translateX(${(window.outerWidth - placeholderRightX) - screenPadding}px)`;
    }
  }

  toggle() {
    if (this.classList.contains('tooltip--open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.classList.add('tooltip--open');
    this.handleDropdownPosition();
  }

  close() {
    this.classList.remove('tooltip--open');
  }

  setup() {
    this.placeholder = this.querySelector('[data-tooltip-placeholder]');
    this.dropdown = this.querySelector('[data-tooltip-dropdown]');

    this.placeholder.addEventListener('click', () => this.handleDropdownPosition());
    this.placeholder.addEventListener('click', () => this.toggle());
  }
}

function dismissAllTooltips(event) {
  if (typeof event.target.closest !== 'function') return;
  const currentTooltip = event.target.closest('carwow-tooltip');

  document.querySelectorAll('.tooltip--open').forEach(tooltip => {
    if (tooltip === currentTooltip) return;

    tooltip.classList.remove('tooltip--open');
  });
}

customElements.define('wow-tooltip', Tooltip);
document.addEventListener('click', e => dismissAllTooltips(e));

// ======================= LOGIN BUTTON =========================

// Login event
loginUser.addEventListener('click', (e) => {
  var emailField = document.getElementById('emailField').value;
  var passwordField = document.getElementById('passwordField').value;

  try {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, emailField, passwordField)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        location.reload();


      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Algo que inseriste está incorreto ou não existe.',
        })
      })

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error
    })
  }

})