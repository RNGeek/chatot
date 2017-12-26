import * as React from 'react';
import './App.css';
import ModeSelect from './ModeSelect';
import Gen4FrmForm from './Gen4FrmForm';
import Gen4ISeedForm from './Gen4ISeedForm';
import Gen5FrmForm from './Gen5FrmForm';
import Gen5ISeedForm from './Gen5ISeedForm';

const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>
        </div>
        <ModeSelect onChange={(selected) => { console.log(selected); }} />
        <Gen4ISeedForm />
        <Gen4FrmForm />
        <Gen5ISeedForm />
        <Gen5FrmForm />
        <div className="input-and-output">
        <div>Input:<br /><textarea id="input" rows={10} cols={40} value="" /></div>
        <div><input type="submit" id="search" value="Search" /></div>
        <div>Output:<br /><textarea id="output" rows={10} cols={80} value="" /></div>
        </div>
        <p id="maxHz">{}</p>
        <p>
          基準周波数: <input type="text" id="freq" value="880" size={6} /> Hz
          maxDecibels: <input type="text" id="maxDecibels" value="-40" size={6} />
        </p>
      </div>
    );
  }
}

export default App;
