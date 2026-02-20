// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAJ_orkgIUsqXLyhRX472muqBEfvJR2pA0",
  authDomain: "gaming-hub-f0a02.firebaseapp.com",
  databaseURL: "https://gaming-hub-f0a02-default-rtdb.firebaseio.com",
  projectId: "gaming-hub-f0a02",
  storageBucket: "gaming-hub-f0a02.firebasestorage.app",
  messagingSenderId: "1082032322501",
  appId: "1:1082032322501:web:092ac218180c625b2cfdac"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const authDiv = document.getElementById("auth");
const dashboard = document.getElementById("dashboard");
const postsDiv = document.getElementById("posts");

// Auth State
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
  const email = emailInput();
  const password = passwordInput();
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

// Login
function login() {
  const email = emailInput();
  const password = passwordInput();
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

function emailInput() {
  return document.getElementById("email").value;
}

function passwordInput() {
  return document.getElementById("password").value;
}

// Add Post
function addPost() {
  const text = document.getElementById("postInput").value;
  if (!text) return alert("Write something first");

  const user = auth.currentUser;

  database.ref("posts").push({
    text: text,
    email: user.email,
    uid: user.uid,
    timestamp: Date.now(),
    likes: 0
  });

  document.getElementById("postInput").value = "";
}

// Load Posts (Real-Time)
function loadPosts() {
  database.ref("posts").on("value", snapshot => {

    postsDiv.innerHTML = "<h3>Community Posts</h3>";

    snapshot.forEach(child => {

      const data = child.val();
      const postId = child.key;
      const currentUser = auth.currentUser;

      const date = new Date(data.timestamp);
      const timeString = date.toLocaleString();

      // ✅ Count likes properly
      const likesCount = data.likes ? Object.keys(data.likes).length : 0;

      // ✅ Check if current user liked
      const userLiked = data.likes && data.likes[currentUser.uid];

      postsDiv.innerHTML += `
        <div class="post-card">
          <strong>${data.email}</strong>
          <p>${data.text}</p>
          <small>${timeString}</small>
          <br>
          ❤️ ${likesCount}
          <button onclick="likePost('${postId}')">
            ${userLiked ? "Unlike" : "Like"}
          </button>
          ${
            currentUser.uid === data.uid
              ? `<button onclick="deletePost('${postId}')">Delete</button>`
              : ""
          }
        </div>
      `;
    });
  });
}

// Like Post
function likePost(postId) {
  const user = auth.currentUser;
  const likeRef = database.ref(`posts/${postId}/likes/${user.uid}`);

  likeRef.once("value").then(snapshot => {
    if (snapshot.exists()) {
      // Unlike
      likeRef.remove();
    } else {
      // Like
      likeRef.set(true);
    }
  });
}

// Delete Post
function deletePost(postId) {
  database.ref("posts/" + postId).remove();
}
