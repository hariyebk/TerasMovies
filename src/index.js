import React from 'react';
// import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import App from './currency'
// import StarRating from './star'

// function Test (){
//   const [state, setState] = useState(0)
//   return <div>
//       <StarRating color="blue" maxLength={10} setState={setState}/>
//       <p> This movie is rated {state} stars</p>
//   </div>
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxLength = {5} messages= {["terrible", "bad", "okay", "good", "excellent"]}/> */}
  </React.StrictMode>
);
