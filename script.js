// ================== FIREBASE CONFIG ==================
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

// ================== AUTH ==================

auth.onAuthStateChanged(user => {

  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";

  if (user) {
    authDiv.style.display = "none";
    dashboard.style.display = "block";
    loadPosts();
  } else {
    authDiv.style.display = "block";
    dashboard.style.display = "none";
  }
});

// ================== SIGNUP ==================

function signup() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Email and Password required");
  }

  if (password.length < 6) {
    return alert("Password must be at least 6 characters");
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch(err => alert(err.message));
}

// ================== LOGIN ==================

function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Enter email and password");
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch(err => alert("Login Failed: " + err.message));
}

// ================== LOGOUT ==================

function logout() {
  auth.signOut().then(() => {
    postsDiv.innerHTML = "";
  });
}

// ================== ADD POST ==================
function addPost() {
  const text = document.getElementById("postInput").value.trim();
  if (!text) return alert("Write something first");

  const user = auth.currentUser;
  if (!user) return alert("Login required");

  database.ref("posts").push({
    text: text,
    email: user.email,
    uid: user.uid,
    timestamp: Date.now(),
    likes: {},
    comments: {}
  });

  document.getElementById("postInput").value = "";
}

// ================== LOAD POSTS ==================
function loadPosts() {
  database.ref("posts").on("value", snapshot => {

    postsDiv.innerHTML = "<h3>Community Posts</h3>";

    if (!snapshot.exists()) {
      postsDiv.innerHTML += "<p>No posts yet</p>";
      return;
    }

    snapshot.forEach(child => {

      const data = child.val();
      const postId = child.key;
      const user = auth.currentUser;

      const timeString = data.timestamp
        ? new Date(data.timestamp).toLocaleString()
        : "";

      const likesCount =
        data.likes && typeof data.likes === "object"
          ? Object.keys(data.likes).length
          : 0;

      const userLiked =
        user &&
        data.likes &&
        typeof data.likes === "object" &&
        data.likes[user.uid];

      // ----- COMMENTS -----
      let commentsHTML = "";
      if (data.comments && typeof data.comments === "object") {
        Object.entries(data.comments).forEach(([cid, comment]) => {
          commentsHTML += `
            <div class="comment">
              <strong>${comment.email}</strong>: ${comment.text}
              <small>${new Date(comment.timestamp).toLocaleString()}</small>
              ${
                user && user.uid === comment.uid
                  ? `<button onclick="deleteComment('${postId}','${cid}')">X</button>`
                  : ""
              }
            </div>
          `;
        });
      }

      postsDiv.innerHTML += `
        <div class="post-card">

          <strong>${data.email}</strong>
          <p>${data.text}</p>
          <small>${timeString}</small>

          <div style="margin-top:8px;">
            ❤️ ${likesCount}
            <button onclick="likePost('${postId}')">
              ${userLiked ? "Unlike" : "Like"}
            </button>

            ${
              user && user.uid === data.uid
                ? `<button onclick="deletePost('${postId}')">Delete</button>`
                : ""
            }
          </div>

          <div class="comments-section">
            <h4>Comments</h4>
            ${commentsHTML}

            <input id="comment-${postId}" placeholder="Write comment..." />
            <button onclick="addComment('${postId}')">Comment</button>
          </div>

        </div>
      `;
    });
  });
}

// ================== LIKE ==================
function likePost(postId) {
  const user = auth.currentUser;
  if (!user) return;

  const likeRef = database.ref("posts/" + postId + "/likes/" + user.uid);

  likeRef.once("value").then(snapshot => {
    if (snapshot.exists()) {
      likeRef.remove();
    } else {
      likeRef.set(true);
    }
  });
}

// ================== DELETE POST ==================
function deletePost(postId) {
  const user = auth.currentUser;
  if (!user) return;

  database.ref("posts/" + postId).remove();
}

// ================== ADD COMMENT ==================
function addComment(postId) {
  const user = auth.currentUser;
  if (!user) return alert("Login required");

  const input = document.getElementById("comment-" + postId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return alert("Write comment");

  database.ref("posts/" + postId + "/comments").push({
    uid: user.uid,
    email: user.email,
    text: text,
    timestamp: Date.now()
  });

  input.value = "";
}

// ================== DELETE COMMENT ==================
function deleteComment(postId, commentId) {
  const user = auth.currentUser;
  if (!user) return;

  database.ref("posts/" + postId + "/comments/" + commentId).remove();
}
