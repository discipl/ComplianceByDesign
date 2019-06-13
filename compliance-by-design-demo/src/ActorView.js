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
            let availableActs = await this.props.lawReg.getAvailableActs(this.props.caseLink, this.props.actorSsid, this.state.facts)
            let potentialActs = await this.props.lawReg.getPotentialActs(this.props.caseLink, this.props.actorSsid, this.state.facts)
            let previousActs = await this.props.lawReg.getActions(this.props.caseLink, this.props.actorSsid)
            this.setState({...this.state, 'availableActs': availableActs, 'potentialActs': potentialActs, 'previousActs': previousActs})
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

    renderAvailableActs() {
        let acts = this.state.availableActs
        if (!acts) {
            return []
        }

        return acts.map((act) => {
            return <li><p>Available: {JSON.stringify(act)}</p> <button onClick={this.takeAction.bind(this, act)}>Act!</button></li>
        })
    }

    renderPotentialActs() {
        let acts = this.state.potentialActs
        if (!acts) {
            return []
        }

        return acts.map((act) => {
            return <li><p>Potential: {JSON.stringify(act)}</p> <button onClick={this.takeAction.bind(this, act)}>Act!</button></li>
        })
    }

    renderWallet() {
        console.log('Rendering wallet from', this.state.facts)
        return this.state.facts.map((fact) => <li><p>{fact}</p></li>)
    }

    renderPreviousActs() {
        if (!this.state.previousActs) {
            return []
        }
        return this.state.previousActs.map((prevAct) => {
            return <li><p>{JSON.stringify(prevAct)}</p></li>
        })
    }


    render() {
        return <div class="container">
            <div class="actorHeader">
              <h3>{this.props.name}</h3>
            </div>
            <div class="acts">
              <ul>
                {this.renderAvailableActs()}
                {this.renderPotentialActs()}
              </ul>
            </div>
            <div class="wallet">
              <h4>Wallet</h4>
              <ul>
                  {this.renderWallet()}
              </ul>
            </div>
            <div class="prevActs">
              <h4>Previous acts</h4>
              <ul>
                  {this.renderPreviousActs()}
              </ul>
            </div>
          </div>
    }
}

export default ActorView
