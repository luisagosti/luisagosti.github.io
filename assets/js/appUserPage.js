//-------------------------Firebase-----------------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged, updatePassword, updateEmail, fetchSignInMethodsForEmail } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';

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

class likesArray {
  constructor(likes) {
    this.likes = likes
  }
  toString() {
    return this.likes;
  }
}

// Firestore likes converter
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



class suggestionArray {
  constructor(suggestion) {
    this.suggestion = suggestion
  }
  toString() {
    return this.suggestion;
  }
}

// Firestore suggestion converter
const convertSuggestionArray = {
  toFirestore: (suggestionArray) => {
    return {
      suggestion: suggestionArray.suggestion,
    };
  },
  fromFirestore: (snapshot, options) => {
    const dataSuggestion = snapshot.data(options);
    return new suggestionArray(dataSuggestion.suggestion);
  }
};


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

    this.placeholder.addEventListener('mouseover', () => this.handleDropdownPosition());
    this.placeholder.addEventListener('touchstart', () => this.toggle());
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
document.addEventListener('touchstart', e => dismissAllTooltips(e));

document.addEventListener("DOMContentLoaded", async function () {
  //  ========== Check if user is logged in ============
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {

      document.getElementById("menuLogin").href = 'userPage.html';

      // =========== POPULATE LIKES TABLE ===============

      var listLikes = document.querySelector("#listLikes tbody")
      var likeButton = document.getElementById('like');

      const ref = doc(db, "users", user.email).withConverter(convertLikesArray);
      const docSnap = await getDoc(ref);

      if (docSnap.exists()) {

        const likesArray = docSnap.data();        // IMPORTANTE

        if (likesArray.toString().length != 0) {
          document.getElementById("likes").innerHTML += '<p class="specific__description">Experimenta clicar no nome da musica!</p>'

          var arrayDiv = new Array();
          const containerDiv = document.createElement("div");
          containerDiv.classList.add("likes-container");

          for (let i = 0; i < likesArray.toString().length; i++) {
            arrayDiv[i] = document.createElement('div');
            arrayDiv[i].id = 'like' + i;
            arrayDiv[i].className = 'like' + i;
            arrayDiv[i].textContent = likesArray.toString()[i];

            arrayDiv[i].style.borderStyle = "none none solid none";
            arrayDiv[i].style.borderWidth = "thin"
            arrayDiv[i].style.height = "50px"
            arrayDiv[i].style.textAlign = "left";
            arrayDiv[i].style.lineHeight = "50px"
            arrayDiv[i].style.cursor = "pointer";

            var containerDivDiv = document.createElement('div');
            containerDivDiv.id = 'like';
            containerDivDiv.className = 'like is-liked';
            containerDivDiv.style.float = "right"
            containerDivDiv.style.zIndex = "200"

            arrayDiv[i].appendChild(containerDivDiv);

            containerDiv.appendChild(arrayDiv[i]);

            arrayDiv[i].addEventListener('click', function (e) {
              if (e.target.textContent == likesArray.toString()[i]) {
                var getInput = likesArray.toString()[i];
                localStorage.setItem("storageName", getInput);
                location.replace("../../html/mainPage.html")
              }
            })

          }

          document.body.appendChild(containerDiv);

          document.getElementById('likedDiv').appendChild(containerDiv)

          document.addEventListener('click', async function (e) {

            if (e.target && e.target.id == 'like') {

              var likeButtonMusic = e.target.parentNode.innerText

              if (e.target.classList.contains('is-liked')) {
                Swal.fire({
                  title: 'Pretendes mesmo remover ' + e.target.parentNode.innerText + ' dos likes?',
                  showDenyButton: true,
                  confirmButtonText: 'Sim',
                  denyButtonText: `Não`,
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    try {

                      await updateDoc(ref, {
                        likes: arrayRemove(likeButtonMusic)
                      });

                      if (e.target.parentNode.id == "like0") {
                        document.getElementById("likes").innerHTML = '<h1 class="section__title-center">Musicas que deste like:</h1><p class="specific__description">De momento não tens nenhuma musica com like.<br><br> <p class="specific__description" style="font-size: small">Experimenta procurar uma pauta na página principal e clicar no coração.</p></p><div id="removeLike" class="snackbar"></div>'
                      }

                      var y = document.getElementById("removeLike");
                      y.innerHTML = "Removido dos likes";
                      y.classList.add("show");
                      e.target.parentNode.remove()
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
                  } else if (result.isDenied) {

                  }
                })

              }
            }

          });

        }
        else {
          document.getElementById("likes").innerHTML += '<p class="specific__description">De momento não tens nenhuma musica com like.<br><br> <p class="specific__description" style="font-size: small">Experimenta procurar uma pauta na página principal e clicar no coração.</p></p>'
        }

      }
      else {
        console.log("No such document!");
      }

      /* ============== SUGGESTIONS ================ */

      var suggestedSongName = document.getElementById("suggestedSongName")
      var suggestedSongBand = document.getElementById("suggestedSongBand")



      const refSuggestion = doc(db, "users", user.email).withConverter(convertSuggestionArray);
      const docSnapSuggestion = await getDoc(refSuggestion);

      if (docSnapSuggestion.exists()) {

        const suggestionArray = docSnapSuggestion.data();        

        document.getElementById("suggestedSongButton").addEventListener('click', async function () {

          var suggestedSong = suggestedSongName.value + " - " + suggestedSongBand.value

          if (suggestionArray.toString().includes(suggestedSong) || suggestedSongName.value === "" || suggestedSongBand.value === "") {

            var x = document.getElementById("addedSuggestion");
            x.innerHTML = "Sugestão inválida.";
            x.classList.add("show");

            setTimeout(function () {
              x.className = x.className.replace("show", "");
            }, 3000);

          } else {
            try {
              await updateDoc(refSuggestion, {
                suggestion: arrayUnion(suggestedSong)
              });

              var x = document.getElementById("addedSuggestion");
              x.innerHTML = "Adicionado às sugestões";
              x.classList.add("show");

              setTimeout(function () {
                x.className = x.className.replace("show", "");
              }, 3000);


            }
            catch (error) {
              console.log(error)
            }
          }

        });

      } else {
        console.log("No such document!");
      }



      /* =============== SHOW PASSWORDS ================= */
      var password = document.getElementById("password");
      var password2 = document.getElementById("password2");

      var checkbox = document.getElementById("checkbox");

      checkbox.addEventListener('click', function () {
        var x = document.getElementById("myInput");
        if (password.type === "password" && password2.type === "password") {
          password.type = "text";
          password2.type = "text"
        } else {
          password.type = "password";
          password2.type = "password";
        }
      })

      /* =============== POPULATE USER INFO ================ */

      var usernameField = document.getElementById("username");
      var userEmailField = document.getElementById("email");

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

          usernameField.value = data.userName
          document.getElementById('menuLogin').textContent = data.userName;
          userEmailField.value = data.userEmail
          password.value = data.userPass
          password2.value = data.userPass

          var userEmailDelete = document.getElementById("email").value;

          document.getElementById("bemVindoText").innerHTML = 'Bem-vindo ' + data.userName

          function validateInput(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
          }

          var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

          /* =============== EDIT DATA ===============*/
          document.getElementById("saveButton").addEventListener('click', async function () {

            if (document.getElementById("username").value && document.getElementById("email").value && document.getElementById("password").value && document.getElementById("password2").value) {
              if (document.getElementById("password").value == document.getElementById("password2").value) {
                if (!format.test(document.getElementById("username").value)) {
                  if (validateInput(document.getElementById("email").value)) {
                    if (document.getElementById("email").value == userEmailDelete) {
                      updatePassword(user, document.getElementById("password2").value).then(async () => {
                        await updateDoc(ref, {
                          userName: document.getElementById("username").value,
                          userPass: document.getElementById("password").value
                        });

                      }).catch((error) => {
                        console.log(error)
                      });

                      updateEmail(auth.currentUser, document.getElementById("email").value).then(async () => {
                        await updateDoc(updateEmailNewEmail, {

                        });
                      }).catch((error) => {
                        console.log(error)
                      });

                      var x = document.getElementById("updateAccount");
                      x.innerHTML = "Dados da conta alterados com sucesso!";
                      x.classList.add("show");
                      setTimeout(function () {
                        x.className = x.className.replace("show", "");
                      }, 3000);
                      setTimeout(function () {
                        document.getElementById("logoutUser").click();
                      }, 3000);
                    } else {
                      fetchSignInMethodsForEmail(auth, document.getElementById("email").value).then(async (result) => {
                        if (result.length) {
                          var x = document.getElementById("updateAccount");
                          x.innerHTML = "Esse email já se encontra em uso";
                          x.classList.add("show");

                          setTimeout(function () {
                            x.className = x.className.replace("show", "");
                          }, 3000);
                        } else {
                          updatePassword(user, document.getElementById("password2").value).then(async () => {
                            await updateDoc(ref, {

                            });

                          }).catch((error) => {
                            console.log(error)
                          });

                          const docRef = doc(db, "users", user.email);
                          const docSnap3 = await getDoc(docRef);
                          var data = docSnap3.data();

                          if (docSnap3.exists()) {

                            await setDoc(doc(db, "users", document.getElementById("email").value), data)
                            await updateDoc(doc(db, "users", document.getElementById("email").value), {
                              userEmail: document.getElementById("email").value,
                              userName: document.getElementById("username").value,
                              userPass: document.getElementById("password").value

                            });

                            const docRef4 = doc(db, "users", document.getElementById("email").value);
                            const docSnap4 = await getDoc(docRef4);
                            if (docSnap4.exists()) {
                              await deleteDoc(doc(db, "users", userEmailDelete));
                            } else {
                              // doc.data() will be undefined in this case
                              console.log("No such document!");
                            }



                            const updateEmailNewEmail = doc(db, "users", document.getElementById("email").value);

                            updateEmail(auth.currentUser, document.getElementById("email").value).then(async () => {
                              await updateDoc(updateEmailNewEmail, {

                              });
                            }).catch((error) => {
                              console.log(error)
                            });

                            var x = document.getElementById("updateAccount");
                            x.innerHTML = "Dados da conta alterados com sucesso!";
                            x.classList.add("show");
                            setTimeout(function () {
                              x.className = x.className.replace("show", "");
                            }, 3000);
                            setTimeout(function () {
                              document.getElementById("logoutUser").click();
                            }, 3000);

                          } else {
                            console.log("No such document!");
                          }
                        }
                      });
                    }
                  } else {
                    var x = document.getElementById("updateAccount");
                    x.innerHTML = "O e-mail encontra-se num formato incorreto.";
                    x.classList.add("show");

                    setTimeout(function () {
                      x.className = x.className.replace("show", "");
                    }, 3000);
                  }
                } else {
                  var x = document.getElementById("updateAccount");
                  x.innerHTML = "O nome não pode conter caracteres especiais.";
                  x.classList.add("show");

                  setTimeout(function () {
                    x.className = x.className.replace("show", "");
                  }, 3000);
                }
              } else {
                var x = document.getElementById("updateAccount");
                x.innerHTML = "As credênciais estão incorretas.";
                x.classList.add("show");

                setTimeout(function () {
                  x.className = x.className.replace("show", "");
                }, 3000);
              }


            } else {
              var x = document.getElementById("updateAccount");
              x.innerHTML = "Não pode existir espaço em branco.";
              x.classList.add("show");

              setTimeout(function () {
                x.className = x.className.replace("show", "");
              }, 3000);
            }
          })
          return new userInfo(data.userEmail, data.userName, data.userPass);
        }
      };


      const ref2 = doc(db, "users", user.email).withConverter(userInfoConverter);
      const docSnap2 = await getDoc(ref2);
      docSnap2.data();

    } else {

    }
  });


  // Logout user
  var logoutUser = document.getElementById("logoutUser");

  logoutUser.addEventListener('click', (e) => {
    signOut(auth).then(() => {
      // Sign-out successful.

      location.replace("mainPage.html")
    }).catch((error) => {
      // An error happened.
    });
  });
});