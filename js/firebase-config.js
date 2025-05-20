// Initialize Firebase with your actual credentials
const firebaseConfig = {
  apiKey: "AIzaSyCkwy-CdhcHCqA3CNZo1jrKsHrzN4Rdlj4",
  authDomain: "smart-farm-c7003.firebaseapp.com",
  databaseURL: "https://smart-farm-c7003-default-rtdb.firebaseio.com",
  projectId: "smart-farm-c7003",
  storageBucket: "smart-farm-c7003.appspot.com",
  messagingSenderId: "734603522825",
  appId: "1:734603522825:web:faaa627d090424aec799d8",
  measurementId: "G-ZSSW7JHJDB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();


// Enable anonymous authentication
auth.signInAnonymously()
  .then(() => console.log("Anonymous authentication successful"))
  .catch(error => console.error("Anonymous auth failed:", error));