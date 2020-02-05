import React, { Component } from 'react';
import './FactPrompt.css'
class FactPrompt extends Component{
    constructor(props) {
        super(props)
        this.state = {
            'factValue': props.factValue,
            'final': props.final || false,
        }
    }
    handleAffirm() {
        const result = this.state.factValue || true
        this.setState({
            'factValue': result,
            'final': true
        })
        this.props.handleResult(result)
    }

    handleDeny() {
        this.setState({
            'factValue': false,
            'final': true
        })
        this.props.handleResult(false)
    }

    handleInput(event) {
        console.log(event.target.value)
        this.setState({
            'factValue': event.target.value
        })
    }

    isFinalBoolean() {
        return this.state.final && typeof this.state.factValue === 'boolean'
    }

    hideTrue() {
        return this.state.final && this.state.factValue !== true
    }

    hideFalse() {
        return this.state.final && this.state.factValue !==false
    }

    render() {
        return (
            <div className="modal-container">
                <section className="modal-main">
                    <span>Is {this.props.fact} van toepassing?</span>
                    <input className="value" placeholder="Waarde van feit" onChange={this.handleInput.bind(this)} value={this.state.factValue} disabled={this.state.final} hidden={this.isFinalBoolean()}/>
                    <span className="buttons">
                        <button className="affirm" hidden={this.hideTrue()} disabled={this.state.final} onClick={this.handleAffirm.bind(this)}>Yes</button>
                        <button className="deny" hidden={this.hideFalse()} disabled={this.state.factValue || this.state.final} onClick={this.handleDeny.bind(this)}>No</button>
                    </span>
                </section>
            </div>
        );
    }
}

export default FactPrompt