import * as React from 'react';
import './App.css';
import ModeSelect from './ModeSelect';
import Gen4FrmForm from './Gen4FrmForm';
import Gen4ISeedForm from './Gen4ISeedForm';
import Gen5FrmForm from './Gen5FrmForm';
import Gen5ISeedForm from './Gen5ISeedForm';
import ToggleDisplay from 'react-toggle-display';

const logo = require('./logo.svg');

interface AppProps {
}
interface AppState {
  selected: string;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
      super(props);
      this.state = {
          selected: '4gen-iseed'
      };
  }
  handleModeChange(selected: string) {
    this.setState({ selected: selected });
  }
  render() {
    return (
      <div>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>
        </div>
        <ModeSelect onChange={(selected) => { this.handleModeChange(selected); }} />
        <ToggleDisplay if={this.state.selected === '4gen-iseed'}><Gen4ISeedForm /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '4gen-frm'}><Gen4FrmForm /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '5gen-iseed'}><Gen5ISeedForm /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '5gen-frm'}><Gen5FrmForm /></ToggleDisplay>
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
