import * as React from 'react';
import { ChangeEvent } from 'react';

interface Gen4FrmFormProps {
}
interface Gen4FrmFormState {
    seed: string;
    frm: string;
}

class Gen4FrmForm extends React.Component<Gen4FrmFormProps, Gen4FrmFormState> {
    constructor(props: Gen4FrmFormProps) {
        super(props);
        this.state = {
            seed: '0x00000000',
            frm: '1000'
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        switch (name) {
            case 'seed':
                this.setState({ seed: target.value });
                break;
            case 'frm':
                this.setState({ frm: target.value });
                break;
            default:
        }
    }

    render() {
        return (
            <form action="javascript:void(0)" >
                seed:
                <input type="text" name="seed" value={this.state.seed} size={22} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />  
                消費数: <input type="text" name="frm" value={this.state.frm} size={10} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />まで
            </form>
        );
    }
}

export default Gen4FrmForm;
