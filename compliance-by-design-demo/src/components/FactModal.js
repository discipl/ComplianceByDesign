import React, { Component } from 'react';
import './FactModal.css'
class FactModal extends Component{
    constructor(props) {
        super(props)
        this.state = {
            'factValue': null
        }
    }
    handleAffirm() {
        const result = this.state.factValue || true
        this.props.handleResult(result)
    }

    handleDeny() {
        this.props.handleResult(false)
    }

    handleInput(event) {
        console.log(event.target.value)
        this.setState({
            'factValue': event.target.value
        })
    }

    render() {
        const showHideClassName = this.props.show ? "modal display-block" : "modal display-none";

        return (
            <div className={showHideClassName}>
                <section className="modal-main">
                    <p>Is {this.props.fact} van toepassing?</p>
                    <input className="value display-block" placeholder="Waarde van feit" onChange={this.handleInput.bind(this)}/>
                    <button className="affirm" onClick={this.handleAffirm.bind(this)}>Yes</button>
                    <button className="deny" disabled={this.state.factValue} onClick={this.handleDeny.bind(this)}>No</button>
                </section>
            </div>
        );
    }
}

export default FactModal