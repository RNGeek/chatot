import * as React from 'react';
import './App.css';
import ModeSelect from './ModeSelect';
import { Gen4FrmForm, Gen4FrmFormState } from './Gen4FrmForm';
import { Gen4ISeedForm, Gen4ISeedFormState }  from './Gen4ISeedForm';
import { Gen5FrmForm, Gen5FrmFormState } from './Gen5FrmForm';
import { Gen5ISeedForm, Gen5ISeedFormState } from './Gen5ISeedForm';
import { parseUint64 } from './rng/util';
import ToggleDisplay from 'react-toggle-display';
import { searchSeedForGen4, searchIseedForGen4, searchfrmForGen4, searchIseedForGen5, searchfrmForGen5 } from './rng/search';
import { Analyser } from './audio/Analyser';

const logo = require('./logo.svg');

interface AppProps {
}
interface AppState {
  selected: string;
  freq: string;
  maxDecibels: string;
  maxHz: number;
  chatotGrowling: boolean;
  input: string;
  output: string;
  gen4ISeedFormState: Gen4ISeedFormState;
  gen4FrmFormState: Gen4FrmFormState;
  gen5ISeedFormState: Gen5ISeedFormState;
  gen5FrmFormState: Gen5FrmFormState;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
      super(props);
      this.state = {
          selected: '4gen-iseed',
          freq: '880',
          maxDecibels: '-40',
          maxHz: 0,
          chatotGrowling: false,
          input: '',
          output: '',
          gen4ISeedFormState: {
            upper: '',
            upperErr: '',
            hour: '',
            minFrame: '',
            maxFrame: '',
            frm: '',
          },
          gen4FrmFormState: {
            seed: '',
            frm: '',
          },
          gen5ISeedFormState: {
            nazo1: '',
            nazo2: '',
            nazo3: '',
            nazo4: '',
            nazo5: '',
            vcount: '',
            gxstat: '',
            frame: '',
            timer0Min: '',
            timer0Max: '',
            macAddr: '',
            time: '',
            timeErr: '',
            frm: '',
          },
          gen5FrmFormState: {
            seed: '',
            frm: '',
          },
      };
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
      const analyser = new Analyser();
      analyser.getFreq = () => Number(this.state.freq);
      analyser.getmaxDecibels = () => Number(this.state.maxDecibels);
      analyser.setMaxHz = (maxHz) => this.setState({ maxHz: maxHz });
      analyser.setChatotGrowling = (chatotGrowling) => this.setState({ chatotGrowling: chatotGrowling });
      analyser.appendToInput = (freq) => {
        let value = this.state.input;
        if (value !== '') {
          value += '\n';
        }
        value += freq;
        this.setState({ input: value });
      };
      analyser.start();
  }
  handleModeChange(selected: string) {
    this.setState({ selected: selected });
  }
  handleGen4FrmFormStateChange(state: Gen4FrmFormState) {
    this.setState({ gen4FrmFormState: {...state} });
  }
  handleGen4ISeedFormStateChange(state: Gen4ISeedFormState) {
    this.setState({ gen4ISeedFormState: {...state} });
  }
  handleGen5FrmFormStateChange(state: Gen5FrmFormState) {
    this.setState({ gen5FrmFormState: {...state} });
  }
  handleGen5ISeedFormStateChange(state: Gen5ISeedFormState) {
    this.setState({ gen5ISeedFormState: {...state} });
  }
  handleSubmit() {
    const freqs = this.state.input.split('\n').map(x => x === '?' ? 0 : parseInt(x, 10));
    const freq = Number(this.state.freq);
    let result: string[];
    switch (this.state.selected) {
      case '4gen-iseed': {
        const upper = Number(this.state.gen4ISeedFormState.upper);
        const upperErr = Number(this.state.gen4ISeedFormState.upperErr);
        const hour = Number(this.state.gen4ISeedFormState.hour);
        const minFrame = Number(this.state.gen4ISeedFormState.minFrame);
        const maxFrame = Number(this.state.gen4ISeedFormState.maxFrame);
        const frm = Number(this.state.gen4ISeedFormState.frm);  
        result = searchIseedForGen4(freqs, upper, upperErr, hour, minFrame, maxFrame, frm, freq);
        break;
      }
      case '4gen-frm': {
        const seed = Number(this.state.gen4FrmFormState.seed);
        const frm = Number(this.state.gen4FrmFormState.frm);
        result = searchfrmForGen4(freqs, seed, frm, freq);
        break;
      }
      case '5gen-iseed': {
        const nazo1 = Number(this.state.gen5ISeedFormState.nazo1);
        const nazo2 = Number(this.state.gen5ISeedFormState.nazo2);
        const nazo3 = Number(this.state.gen5ISeedFormState.nazo3);
        const nazo4 = Number(this.state.gen5ISeedFormState.nazo4);
        const nazo5 = Number(this.state.gen5ISeedFormState.nazo5);
        const vcount = Number(this.state.gen5ISeedFormState.vcount);
        const gxstat = Number(this.state.gen5ISeedFormState.gxstat);
        const frame = Number(this.state.gen5ISeedFormState.frame);
        const timer0Min = Number(this.state.gen5ISeedFormState.timer0Min);
        const timer0Max = Number(this.state.gen5ISeedFormState.timer0Max);
        const matched = this.state.gen5ISeedFormState.macAddr.match(/^([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})-([0-9a-f]{2})$/i);
        const macAddr = matched ? matched.slice(1, 7).map(x => parseInt(x, 16)) : [0, 0, 0, 0, 0, 0];
        const matched2 = this.state.gen5ISeedFormState.time.match(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/);
        let time;
        if (matched2) {
          time = new Date(Number(matched2[1]), Number(matched2[2]) - 1, Number(matched2[3]), Number(matched2[4]), Number(matched2[5]), Number(matched2[6]));
        } else {
          time = new Date(2000, 0, 1);
        }
        const timeErr = Number(this.state.gen5ISeedFormState.timeErr);
        const maxfrm = Number(this.state.gen5ISeedFormState.frm);
        result = searchIseedForGen5(freqs, freq, nazo1, nazo2, nazo3, nazo4, nazo5,
                                    vcount, gxstat, frame, timer0Min, timer0Max, macAddr, time, timeErr, maxfrm);
        break;
      }
      case '5gen-frm': {
        const seed = parseUint64(this.state.gen5FrmFormState.seed.slice(2));
        const frm = Number(this.state.gen5FrmFormState.frm);
        result = searchfrmForGen5(freqs, seed, frm, freq);
        break;
      }
      default:
        result = [];
    }
    this.setState({ output: result.length > 0 ? result.join('\n') : 'not found' });
  }
  
  handleTextAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const target = event.target;
    const name = target.name;
    let state = this.state;
    switch (name) {
      case 'input':
        state = Object.assign(state, { input: target.value });
        break;
      default:
    }
    this.setState(state);
  }
  
  handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const name = target.name;
    let state = this.state;
    switch (name) {
      case 'freq':
        state = Object.assign(state, { freq: target.value });
        break;
      case 'maxDecibels':
        state = Object.assign(state, { maxDecibels: target.value });
        break;
      default:
    }
    this.setState(state);
  }
  render() {
    return (
      <div>
        <ModeSelect onChange={(selected) => { this.handleModeChange(selected); }} />
        <ToggleDisplay if={this.state.selected === '4gen-iseed'}><Gen4ISeedForm onchange={(state) => { this.handleGen4ISeedFormStateChange(state); }} /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '4gen-frm'}><Gen4FrmForm onchange={(state) => { this.handleGen4FrmFormStateChange(state); }} /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '5gen-iseed'}><Gen5ISeedForm onchange={(state) => { this.handleGen5ISeedFormStateChange(state); }} /></ToggleDisplay>
        <ToggleDisplay if={this.state.selected === '5gen-frm'}><Gen5FrmForm onchange={(state) => { this.handleGen5FrmFormStateChange(state); }} /></ToggleDisplay>
        <div className="input-and-output">
        <div>Input:<br /><textarea name="input" rows={10} cols={40} value={this.state.input} onChange={this.handleTextAreaChange} /></div>
        <div><input type="submit" id="search" value="Search" onClick={() => { this.handleSubmit(); }} /></div>
        <div>Output:<br /><textarea id="output" rows={10} cols={80} value={this.state.output} /></div> 
        </div>
        <p id="maxHz" style={{ background: this.state.chatotGrowling ? '#f9c94f' : 'white' }}>{this.state.maxHz} Hz</p>
        <p>
          基準周波数: <input type="text" name="freq" value={this.state.freq} size={6} onChange={this.handleInputChange} /> Hz
          maxDecibels: <input type="text" name="maxDecibels" value={this.state.maxDecibels} size={6} onChange={this.handleInputChange} />
        </p>
      </div>
    );
  }
}

export default App;
