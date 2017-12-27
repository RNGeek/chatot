import * as React from 'react';

interface Gen5ISeedFormProps {
    onchange: (state: Gen5ISeedFormState) => void;
}
export interface Gen5ISeedFormState {
    nazo1: string;
    nazo2: string;
    nazo3: string;
    nazo4: string;
    nazo5: string;
    vcount: string;
    gxstat: string;
    frame: string;
    timer0Min: string;
    timer0Max: string;
    macAddr: string;
    time: string;
    timeErr: string;
    frm: string;
}

export class Gen5ISeedForm extends React.Component<Gen5ISeedFormProps, Gen5ISeedFormState> {
    constructor(props: Gen5ISeedFormProps) {
        super(props);
        this.state = {
            nazo1: '0x02215f30',
            nazo2: '0x0221602c',
            nazo3: '0x0221602c',
            nazo4: '0x02216078',
            nazo5: '0x02216078',
            vcount: '0x5c',
            gxstat: '0x6000000',
            frame: '0x5',
            timer0Min: '0x0bfb',
            timer0Max: '0x0bfb',
            macAddr: '00-09-BF-12-34-56',
            time: '2000-01-01 00:00:00',
            timeErr: '2',
            frm: '200',
        };
        this.props.onchange(this.state);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        let state = this.state;
        switch (name) {
            case 'nazo1':
                state = Object.assign(state, { nazo1: target.value });
                break;
            case 'nazo2':
                state = Object.assign(state, { nazo2: target.value });
                break;
            case 'nazo3':
                state = Object.assign(state, { nazo3: target.value });
                break;
            case 'nazo4':
                state = Object.assign(state, { nazo4: target.value });
                break;
            case 'nazo5':
                state = Object.assign(state, { nazo5: target.value });
                break;
            case 'vcount':
                state = Object.assign(state, { vcount: target.value });
                break;
            case 'gxstat':
                state = Object.assign(state, { gxstat: target.value });
                break;
            case 'frame':
                state = Object.assign(state, { frame: target.value });
                break;
            case 'timer0-min':
                state = Object.assign(state, { timer0Min: target.value });
                break;
            case 'timer0-max':
                state = Object.assign(state, { timer0Max: target.value });
                break;
            case 'macaddr':
                state = Object.assign(state, { macAddr: target.value });
                break;
            case 'time':
                state = Object.assign(state, { time: target.value });
                break;
            case 'time-err':
                state = Object.assign(state, { timeErr: target.value });
                break;
            case 'frm':
                state = Object.assign(state, { frm: target.value });
                break;
            default:
        }
        this.setState(state);
        this.props.onchange(state);
    }

    render() {
        return (
            <form action="javascript:void(0)">
                nazo1: <input type="text" name="nazo1" value={this.state.nazo1} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                nazo2: <input type="text" name="nazo2" value={this.state.nazo2} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                nazo3: <input type="text" name="nazo3" value={this.state.nazo3} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                nazo4: <input type="text" name="nazo4" value={this.state.nazo4} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                nazo5: <input type="text" name="nazo5" value={this.state.nazo5} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} /><br />
                vcount: <input type="text" name="vcount" value={this.state.vcount} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                gxstat: <input type="text" name="gxstat" value={this.state.gxstat} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                frame: <input type="text" name="frame" value={this.state.frame} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} /><br />
                timer0: <input type="text" name="timer0-min" value={this.state.timer0Min} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                ～ <input type="text" name="timer0-max" value={this.state.timer0Max} size={16} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} /><br />
                mac addr: <input type="text" name="macaddr" value={this.state.macAddr} size={28} required={true} pattern="(?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}" onChange={this.handleInputChange} />
                <a id="save-button" href="javascript:void(0)" className="likeabutton">保存</a>
                <span id="saved" /><br />
                time: <input type="text" name="time" value={this.state.time} size={28} required={true} pattern="\\d+-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" onChange={this.handleInputChange} />
                <a id="now-time-button2" href="javascript:void(0)" className="likeabutton">現在時刻</a>
                ± <input type="text" name="time-err" value={this.state.timeErr} size={6} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} /> sec.
                消費数: <input type="text" name="frm" value={this.state.frm} size={10} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />まで
            </form>
        );
    }
}
