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
  const text = document.getElementById("postInput").value.trim();
  if (!text) return alert("Write something first");

  const user = auth.currentUser;

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
// Load Posts (Real-Time)
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
      const currentUser = auth.currentUser;

      const date = new Date(data.timestamp);
      const timeString = date.toLocaleString();

      // ✅ Safe like count
      const likesCount =
  data.likes && typeof data.likes === "object"
    ? Object.keys(data.likes).length
    : 0;

      // ✅ Safe liked check
      const userLiked =
        currentUser && data.likes && data.likes[currentUser.uid];

      // ✅ Render comments
      let commentsHTML = "";
      if (data.comments) {
        Object.entries(data.comments).forEach(([cid, comment]) => {
          commentsHTML += `
            <div class="comment">
              <strong>${comment.email}</strong>: ${comment.text}
              <small>${new Date(comment.timestamp).toLocaleString()}</small>
              ${
                currentUser && currentUser.uid === comment.uid
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
              currentUser && currentUser.uid === data.uid
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
// Like Post
function likePost(postId) {
  const user = auth.currentUser;
  if (!user) return;

  const likeRef = database.ref(`posts/${postId}/likes/${user.uid}`);

  likeRef.once("value", snapshot => {
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
// Add Comment
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
