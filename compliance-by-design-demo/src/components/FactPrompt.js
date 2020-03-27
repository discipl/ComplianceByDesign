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
        this.props.handleResult(result, this.props.possibleCreatingActions)
    }

    handleDeny() {
        this.setState({
            'factValue': false,
            'final': true
        })
        this.props.handleResult(false, this.props.possibleCreatingActions)
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

    renderOptions() {
        return this.props.possibleCreatingActions.map(possibleCreatingAction => {
            const numberCandidates = this.props.previousActs.map(
                (prevAct, index) => {
                    return {index: index, ...prevAct} }
                    ).filter(prevAct => prevAct.link === possibleCreatingAction)
            const number = numberCandidates.length > 0 ? numberCandidates[0].index + 1 : "Unknown act"
            return <option value={possibleCreatingAction}>{number}</option>
        })
    }

    renderInput() {
        console.log("Props", this.props)
        if (Array.isArray(this.props.possibleCreatingActions) && this.props.possibleCreatingActions.length > 0) {
            return <select className="value" onChange={this.handleInput.bind(this)} value={this.state.factValue} disabled={this.state.final} hidden={this.isFinalBoolean()}>{this.renderOptions()}</select>
        }
        else {
            return <input className="value" placeholder="Waarde van feit" onChange={this.handleInput.bind(this)} value={this.state.factValue} disabled={this.state.final} hidden={this.isFinalBoolean()}/>
        }
    }

    render() {
        return (
            <div className="modal-container">
                <section className="modal-main">
                    <span>Is {this.props.fact} van toepassing?</span>
                    {this.renderInput()}
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