import { initializeApp} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getAuth, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import { getDatabase, ref , onValue, set, push} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD9O3sjJkaqNyKHshbhua8PhelP9toU5i0",
    authDomain: "theprivate-404e9.firebaseapp.com",
    projectId: "theprivate-404e9",
    storageBucket: "theprivate-404e9.appspot.com",
    messagingSenderId: "374618793944",
    appId: "1:374618793944:web:c6c00e8b1e956f4dcc74ad",
    measurementId: "G-1X2SC4FQCD"
  };

  const app = initializeApp(firebaseConfig);

  const email = document.getElementById("userEmail");
  const password = document.getElementById("userPassword");

  const signin = document.getElementById("login-btn");
  const logindiv = document.getElementById("login-div");
  const sendMsg = document.getElementById("send-btn");
  const message = document.getElementById("message-input");

  const chatContainer = document.getElementById("chat-container");
  const dynamicText  = document.getElementById("dyText");


    
  const auth = getAuth(app);
  const db = getDatabase(app);


const chatElement = document.getElementById("dyText");
const textToType = [
    "Connecting to server...",
    "server 192.168.hinduverse..",
    "Connected successfully.",
    "Accessing confidential files...",
    "Welcome to the thePrivate secure server.",
    "Authenticate to continue, enter your email below, press tab and enter your passcode, hit enter to authenticate..."
    
];

function typeText() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < textToType.length) {
            const messageElement = document.createElement("p");
            messageElement.id = "typeText";
            messageElement.textContent = textToType[i];
            chatElement.appendChild(messageElement);
            chatElement.scrollTop = chatElement.scrollHeight;
            i++;
        } else {
            clearInterval(interval);
        }
    }, 1000); // Adjust the typing speed here
}

  

    const currentUser = localStorage.getItem('currentUserUid');

    if(currentUser){
        getMessage(displayMessage)
        logindiv.style.display = "none";
        chatContainer.style.display = "flex";
    }
    else{
        logindiv.style.display = "flex";
        chatContainer.style.display = "none";
        typeText();
    }
    

    function createChatCard(post){
        // Create a new div element with class "chat-item"
        const chatItemDiv = document.createElement('div');
        chatItemDiv.classList.add('chat-item');        

        // Create a paragraph element for the username
        const usernamePara = document.createElement('p');
        usernamePara.id = 'username';

        // Create a paragraph element for the message
        const messagePara = document.createElement('code');
        messagePara.id = 'message';
        messagePara.textContent = post.message;

        // Append the username and message paragraphs to the chat-item div
        chatItemDiv.appendChild(usernamePara);
        chatItemDiv.appendChild(messagePara);

        // Append the chat-item div to the document body or another container
        chatContainer.appendChild(chatItemDiv);

        const userData = ref(db,'users/'+post.username);
        onValue(userData, (snapshot)=>{
            const data = snapshot.val();
            if(data){
                usernamePara.textContent = data.name+":";
            }
        });

    }

    function getMessage(callback){
        dynamicText.innerHTML = "fethching chats please wait........"
        chatContainer.innerHTML = "";
        

        const chatData = ref(db,'Chats');
        // Remove the previous event listener (if any) to prevent duplicates
        onValue(chatData, (snapshot)=>{
            const data = snapshot.val();
            callback(data);
        });
    }

    function displayMessage(data){
        chatContainer.innerHTML = ""; // Clear the chat container

     for (let key in data) {
        const post = data[key];
        createChatCard(post);
        if(post.sender !== currentUser){
            requestNotificationPermission();
        }
        }
    }

    function uploadMessage(messageText, username) {
        const db = getDatabase();
        // Reference to the "messages" node in your Firebase database
        const timestamp = Date.now();

        set(ref(db,'Chats/'+timestamp),{
            message: messageText,
            username: username,
            sender: currentUser
        })
        .then(()=>{
            console.log("Message uploaded successfully!");
        })
        .catch((error)=>{
            console.log("Error uploading message:", error);
        })

      }

      message.addEventListener('paste', function (e) {
        e.preventDefault(); // Prevent the default paste behavior
    
        // Get the pasted text from the clipboard
        const pastedText = e.clipboardData.getData('text/plain');
    
        // Insert the pasted text with newline characters
        const currentCursorPosition = this.selectionStart;
        const textBeforeCursor = this.value.slice(0, currentCursorPosition);
        const textAfterCursor = this.value.slice(currentCursorPosition);
        this.value = textBeforeCursor + pastedText + textAfterCursor;
    
        // Update the cursor position
        this.selectionStart = this.selectionEnd = currentCursorPosition + pastedText.length;
    });

    message.addEventListener('keydown', function (e) {
        // Check if the Enter key (keyCode 13) is pressed
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault(); // Prevent the default behavior of Enter key
            if(message.value === "logout"){
                logout();
                message.value = "";
            }else{
                uploadMessage(message.value, currentUser);
                message.value = "";
            }
        }
    });

    function logout(){
        localStorage.removeItem('currentUserUid');
        window.location.reload();
    }
      

    sendMsg.addEventListener("click",(e)=>{
        e.preventDefault();
        if(message.value === "logout"){
            logout();
            message.value = "";
        }else{
            uploadMessage(message.value, currentUser);
            message.value = "";
        }
        
    });

    signin.addEventListener("click",(e)=>{
        e.preventDefault();
        dynamicText.innerHTML = "Authenticating......"
        signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential)=>{
            const user = userCredential.user;
            localStorage.setItem('currentUserUid',user.uid);
            logindiv.style.display = "none";
            getMessage(displayMessage);
            dynamicText.innerHTML = "Authentication Successful.."
            window.location.reload();
        })
  });

  // ... Your existing code ...

// Function to request notification permission
function requestNotificationPermission(title,body) {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                // Permission granted, you can now show notifications
                onNewMessageReceived()
            }
        });
    }
}

// Function to display a notification
function displayNotification(title, body) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, { body });
        notification.onclick = function () {
            // Bring the chat window to the foreground or navigate to the chat room
            window.focus();
        };
    }
}

// ... Your existing code ...

// When a new message arrives, display a notification
function onNewMessageReceived() {
    const title = "New Message";
    const body = "You have a new chat message.";
    displayNotification(title, body);

    // Handle the new message and update the chat window
    // ...
}




    