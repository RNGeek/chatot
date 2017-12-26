import * as React from 'react';
import './App.css';
import Gen4FrmForm from './Gen4FrmForm';
import Gen4ISeedForm from './Gen4ISeedForm';

const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Gen4FrmForm />
        <Gen4ISeedForm />
      </div>
    );
  }
}

export default App;
