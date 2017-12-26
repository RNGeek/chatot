import * as React from 'react';

interface Gen5FrmFormProps {
}
interface Gen5FrmFormState {
    seed: string;
    frm: string;
    visible: boolean;
}

class Gen5FrmForm extends React.Component<Gen5FrmFormProps, Gen5FrmFormState> {
    constructor(props: Gen5FrmFormProps) {
        super(props);
        this.state = {
            seed: '0x0000000000000000',
            frm: '1000',
            visible: true,
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
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
            <form action="javascript:void(0)" style={{display: this.state.visible ? 'block' : 'none'}}>
                seed: <input type="text" name="seed" value={this.state.seed} size={22} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />  
                消費数: <input type="text" name="frm" value={this.state.frm} size={10} required={true} pattern="0[xX][0-9a-fA-F]+|\\d+" onChange={this.handleInputChange} />まで
            </form>
        );
    }
}

export default Gen5FrmForm;
