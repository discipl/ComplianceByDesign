import React, { Component } from 'react';
import './FactModal.css'
class FactModal extends Component{
    handleAffirm() {
        this.props.handleResult(true)
    }

    handleDeny() {
        this.props.handleResult(false)
    }

    render() {
        const showHideClassName = this.props.show ? "modal display-block" : "modal display-none";

        return (
            <div className={showHideClassName}>
                <section className="modal-main">
                    <p>Is {this.props.fact} van toepassing?</p>
                    <button className="affirm" onClick={this.handleAffirm.bind(this)}>Yes</button>
                    <button className="deny" onClick={this.handleDeny.bind(this)}>No</button>
                </section>
            </div>
        );
    }
}

export default FactModal