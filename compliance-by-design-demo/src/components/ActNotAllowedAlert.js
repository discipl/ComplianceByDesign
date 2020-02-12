import React, { Component } from "react";
import "./ActNotAllowedAlert.css"

class ActNotAllowedAlert extends Component {
    render() {
        const showHideClassName = this.props.act ? "disallow-modal display-block" : "modal display-none";

        return (
            <div className={showHideClassName}>
                <section className="disallow-modal-main">
                    <span>Handeling {this.props.act} is niet toegestaan!</span>
                    <span className="buttons">
                        <button onClick={this.props.handleClose}>Close</button>
                    </span>
                </section>
            </div>
        );
    }
}

export {ActNotAllowedAlert};