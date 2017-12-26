import * as React from 'react';

interface ModeSelectProps {
    onChange: (selected: string) => void;
}
interface ModeSelectState {
    selected: string;
}

class ModeSelect extends React.Component<ModeSelectProps, ModeSelectState> {
    constructor(props: ModeSelectProps) {
        super(props);
        this.state = {
            selected: '4gen-iseed'
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        this.setState({ selected: target.value });
        this.props.onChange(target.value);
    }

    render() {
        return (
            <p>
                <label><input type="radio" name="mode" value="4gen-iseed" required={true} checked={this.state.selected === '4gen-iseed'} onChange={this.handleInputChange} />4gen 初期seed検索</label>
                <label><input type="radio" name="mode" value="4gen-frm" required={true} checked={this.state.selected === '4gen-frm'} onChange={this.handleInputChange} />4gen 消費数検索</label>
                <label><input type="radio" name="mode" value="5gen-iseed" required={true} checked={this.state.selected === '5gen-iseed'} onChange={this.handleInputChange} />5gen 初期seed検索</label>
                <label><input type="radio" name="mode" value="5gen-frm" required={true} checked={this.state.selected === '5gen-frm'} onChange={this.handleInputChange} />5gen 消費数検索</label>
            </p>
        );
    }
}

export default ModeSelect;
