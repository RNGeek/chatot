import * as React from 'react';

interface Gen5ISeedFormProps {
}
interface Gen5ISeedFormState {
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
    visible: boolean;
}

class Gen5ISeedForm extends React.Component<Gen5ISeedFormProps, Gen5ISeedFormState> {
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
            visible: true,
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        switch (name) {
            case 'nazo1':
                this.setState({ nazo1: target.value });
                break;
            case 'nazo2':
                this.setState({ nazo2: target.value });
                break;
            case 'nazo3':
                this.setState({ nazo3: target.value });
                break;
            case 'nazo4':
                this.setState({ nazo4: target.value });
                break;
            case 'nazo5':
                this.setState({ nazo5: target.value });
                break;
            case 'vcount':
                this.setState({ vcount: target.value });
                break;
            case 'gxstat':
                this.setState({ gxstat: target.value });
                break;
            case 'frame':
                this.setState({ frame: target.value });
                break;
            case 'timer0-min':
                this.setState({ timer0Min: target.value });
                break;
            case 'timer0-max':
                this.setState({ timer0Max: target.value });
                break;
            case 'macaddr':
                this.setState({ macAddr: target.value });
                break;
            case 'time':
                this.setState({ time: target.value });
                break;
            case 'time-err':
                this.setState({ timeErr: target.value });
                break;
            case 'frm':
                this.setState({ frm: target.value });
                break;
            default:
        }
    }

    render() {
        return (
            <form action="javascript:void(0)" style={{display: this.state.visible ? 'block' : 'none'}}>
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

export default Gen5ISeedForm;
