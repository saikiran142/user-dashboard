import firebase from 'firebase';
const firebaseConfig = firebase.initializeApp({
    apiKey: "AIzaSyCPJO7FOmnIevD8ykIh7OBJPj-J3KkXpRU",
    authDomain: "user-bb641.firebaseapp.com",
    databaseURL: "https://user-bb641.firebaseio.com",
    projectId: "user-bb641",
    storageBucket: "user-bb641.appspot.com",
    messagingSenderId: "332159716790",
    appId: "1:332159716790:web:f35f71994cccae740f8517",
    measurementId: "G-V35WQ0W988"
  });

  const db = firebaseConfig.firestore();
  const auth = firebase.auth();
  const storage = firebase.storage();

  export { db, auth, storage}