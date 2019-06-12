import React, { Component } from 'react';
import './ActorView.css'

class ActorView extends Component {
    constructor(props) {
        super(props)
        console.log('Constructing ActorView', props)
        this.state = {
            'facts': []
        }
    }

    async componentDidUpdate(prevProps) {
        if (this.props.caseLink !== prevProps.caseLink || this.props.actorSsid !== prevProps.actorSsid) {
            console.log('Rendering available acts and potential acts with props', this.props)
            let availableActs = await this.renderAvailableActs()
            let potentialActs = await this.renderPotentialActs()
            this.setState({...this.state, 'availableActs': availableActs, 'potentialActs': potentialActs})
        }

    }

    async takeAction(act) {
        let caseLink = await this.props.lawReg.take(this.props.actorSsid, this.props.caseLink, act, this.askFact.bind(this))
        if (this.props.onCaseChange) {
            this.props.onCaseChange(caseLink)
        }
    }

    askFact (fact) {
        let result = window.confirm('Is ' + fact + ' van toepassing?')

        console.log('ActorView', this)
        if (result) {
            let newFacts = this.state.facts.slice(0)
            newFacts.push(fact)
            this.setState({...this.state, 'facts': newFacts})
        }

        return result
    }

    async renderAvailableActs(args) {
        let acts = await this.props.lawReg.getAvailableActs(this.props.caseLink, this.props.actorSsid, this.state.facts)

        return acts.map((act) => {
            return <li><p>Available: {JSON.stringify(act)}</p> <button onClick={this.takeAction.bind(this, act)}>Act!</button></li>
        })
    }

    async renderPotentialActs() {
        let acts = await this.props.lawReg.getPotentialActs(this.props.caseLink, this.props.actorSsid, this.state.facts)

        return acts.map((act) => {
            return <li><p>Potential: {JSON.stringify(act)}</p> <button onClick={this.takeAction.bind(this, act)}>Act!</button></li>
        })
    }

    renderWallet() {
        console.log('Rendering wallet from', this.state.facts)
        return this.state.facts.map((fact) => <li><p>{fact}</p></li>)
    }

    render() {
        return <div>
            <h3>{this.props.name}</h3>
            <ul>
                {this.state.availableActs}
                {this.state.potentialActs}
            </ul>
            <h4>Wallet</h4>
            <ul>
                {this.renderWallet()}
            </ul>
            </div>
    }
}

export default ActorView