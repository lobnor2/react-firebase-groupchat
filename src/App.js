import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore'; //for database
import 'firebase/auth'; // for user authentication
import 'firebase/analytics';


//firebase hooks to work easier with firebase and react
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';
// const [user] = useAuthState(auth); //signed in user is an object and signed out user is null

//initialize firebase project here
firebase.initializeApp({
  //your config
  // copied from firebase const firebaseCondig
  apiKey: "AIzaSyAwqQh7BKYm7TCme-uK3Ljx7-P1gnVYpOo",
  authDomain: "react-firebase-groupchat.firebaseapp.com",
  projectId: "react-firebase-groupchat",
  storageBucket: "react-firebase-groupchat.appspot.com",
  messagingSenderId: "869136593902",
  appId: "1:869136593902:web:f8ddfc73df3ac2a56654ff",
  measurementId: "G-1EQ347F1FM"
})


//reference to auth and firestore as global variable 
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>Chat</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
    const useSignInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
    return (
      <>
      
      <button onClick={ useSignInWithGoogle }>
        Sign in with Google
      </button>
      <p>Do not violate the comjunity guidelines or you will be banned for life</p>
      </>
    )
}

function SignOut() {
     return auth.currentUser && (
       <button className='sign-out' onClick={ () => auth.signOut() }>Sign Out</button>
     )
}

function ChatRoom() {
  const dummy = useRef();
    const messagesRef = firestore.collection('messages');//query documents in a collection
    const query = messagesRef.orderBy('createdAt').limit(25);
    const  [messages] = useCollectionData(query,  {idField: 'id'}); //listen to data with hook
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
      e.preventDefault();

      const { uid, photoURL } = auth.currentUser;
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
      setFormValue('');
      dummy.current.scrollIntoView({ behavior:'smooth'});
    }
    return (
      <>
        <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={ dummy }></span>
        </main>
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something here" />
          <button type="submit" disabled={!formValue}>hello</button>

        </form>
      
      
      </>
    )

}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
          <img src={photoURL || 'https://api/adorable.io/avatars/23/abott@adorable.png'} alt="" />
          <p>{text}</p>
      </div>
    
    
    
    
    </>
  )
}

export default App;
