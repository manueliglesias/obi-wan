import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import { Amplify } from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";
import { default as awsConfig } from "./aws-exports";

import { Post } from "./models";

Amplify.configure(awsConfig);

function App() {
  useEffect(() => {

    (async function() {
      // await DataStore.start();

      console.log(await DataStore.query(Post));
    }).apply(undefined);
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
