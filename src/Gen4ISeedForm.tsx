import * as React from 'react';

interface Gen4ISeedFormProps {
}
interface Gen4ISeedFormState {
    upper: string;
    upperErr: string;
    hour: string;
    minFrame: string;
    maxFrame: string;
    frm: string;
    visible: true;
}

class Gen4ISeedForm extends React.Component<Gen4ISeedFormProps, Gen4ISeedFormState> {
    constructor(props: Gen4ISeedFormProps) {
        super(props);
        this.state = {
            upper: '0x00',
            upperErr: '1',
            hour: '0',
            minFrame: '0x190',
            maxFrame: '0x450',
            frm: '50',
            visible: true,
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        switch (name) {
            case 'upper':
                this.setState({ upper: target.value });
                break;
            case 'upper-err':
                this.setState({ upperErr: target.value });
                break;
            case 'hour':
                this.setState({ hour: target.value });
                break;
            case 'min-frame':
                this.setState({ minFrame: target.value });
                break;
            case 'max-frame':
                this.setState({ maxFrame: target.value });
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
                月×日+分+秒: <input type="text" name="upper" value={this.state.upper} size={5} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} /> ±
                <input type="text" name="upper-err" value={this.state.upperErr} size={5} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                時: <input type="text" name="hour" value={this.state.hour} size={5} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />
                <a id="now-time-button" href="javascript:void(0)" className="likeabutton">現在時刻</a><br />
                待機フレーム+年: <input type="text" name="min-frame" value={this.state.minFrame} size={8} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+"  onChange={this.handleInputChange} /> ～
                <input type="text" name="max-frame" value={this.state.maxFrame} size={8} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+"  onChange={this.handleInputChange} />
                消費数: <input type="text" name="frm" value={this.state.frm} size={8} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+"  onChange={this.handleInputChange} />まで
           </form>
        );
    }
}

export default Gen4ISeedForm;
