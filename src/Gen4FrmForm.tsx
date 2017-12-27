import * as React from 'react';

interface Gen4FrmFormProps {
    onchange: (state: Gen4FrmFormState) => void;
}
export interface Gen4FrmFormState {
    seed: string;
    frm: string;
}

export class Gen4FrmForm extends React.Component<Gen4FrmFormProps, Gen4FrmFormState> {
    constructor(props: Gen4FrmFormProps) {
        super(props);
        this.state = {
            seed: '0x00000000',
            frm: '1000',
        };
        this.props.onchange(this.state);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        let state = this.state;
        switch (name) {
            case 'seed':
                state = Object.assign(state, { seed: target.value });
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
                seed: <input type="text" name="seed" value={this.state.seed} size={22} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />  
                消費数: <input type="text" name="frm" value={this.state.frm} size={10} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />まで
            </form>
        );
    }
}
