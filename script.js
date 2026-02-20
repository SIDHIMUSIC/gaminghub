// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJ_orkgIUsqXLyhRX472muqBEfvJR2pA0",
  authDomain: "gaming-hub-f0a02.firebaseapp.com",
  databaseURL: "https://gaming-hub-f0a02-default-rtdb.firebaseio.com",
  projectId: "gaming-hub-f0a02",
  storageBucket: "gaming-hub-f0a02.firebasestorage.app",
  messagingSenderId: "1082032322501",
  appId: "1:1082032322501:web:092ac218180c625b2cfdac"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const authDiv = document.getElementById("auth");
const dashboard = document.getElementById("dashboard");
const postsDiv = document.getElementById("posts");

// Check Login State
auth.onAuthStateChanged(user => {
  if (user) {
    authDiv.style.display = "none";
    dashboard.style.display = "block";
    loadPosts();
  } else {
    authDiv.style.display = "block";
    dashboard.style.display = "none";
  }
});

// Signup
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
}

// Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
}

// Logout
function logout() {
  auth.signOut();
}

// Add Post
function addPost() {
  const text = document.getElementById("postInput").value;
  const user = auth.currentUser.email;

  database.ref("posts").push({
    text: text,
    user: user
  });

  document.getElementById("postInput").value = "";
}

// Load Posts
function loadPosts() {
  database.ref("posts").on("value", snapshot => {
    postsDiv.innerHTML = "<h3 style='margin-top:20px;'>Community Posts</h3>";

    snapshot.forEach(child => {
      const data = child.val();

      postsDiv.innerHTML += `
        <div style="
          background:#111;
          margin:15px 0;
          padding:15px;
          border-radius:10px;
          box-shadow:0 0 10px #ff00aa;
        ">
          <strong>${data.user}</strong>
          <p>${data.text}</p>
        </div>
      `;
    });
  });
}
