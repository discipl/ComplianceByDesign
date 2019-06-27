import React, { Component } from 'react';
import './ActorView.css'

class ActorView extends Component {
    constructor(props) {
        super(props)
        console.log('Constructing ActorView', props)
        this.state = {
            'facts': [],
            'nonFacts': []
        }
    }

    async componentDidUpdate(prevProps) {
        if (this.props.caseLink !== prevProps.caseLink || this.props.actorSsid !== prevProps.actorSsid) {
            console.log('Rendering available acts and potential acts with props', this.props)
            let availableActs = await Promise.all((await this.props.lawReg.getAvailableActs(this.props.caseLink, this.props.actorSsid, this.state.facts))
                .map(async (act) => {
                    const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                    return {...act, 'details': details}
                }))
            let potentialActs = await Promise.all((await this.props.lawReg.getPotentialActs(this.props.caseLink, this.props.actorSsid, this.state.facts))
                .map(async (act) => {
                    const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                    return {...act, 'details': details}
                }))
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
        if (this.state.facts.includes(fact)) {
            return true
        }

        if (this.state.nonFacts.includes(fact)) {
            return false
        }

        let result = window.confirm('Is ' + fact + ' van toepassing?')

        console.log('ActorView', this)
        if (result) {
            let newFacts = this.state.facts.slice(0)
            newFacts.push(fact)
            this.setState({...this.state, 'facts': newFacts})
        }
        else {
            let newNonFacts = this.state.nonFacts.slice(0)
            newNonFacts.push(fact)
            this.setState({...this.state, 'nonFacts': newNonFacts})
        }

        return result
    }

    renderAvailableActs() {
        let acts = this.state.availableActs
        if (!acts) {
            return []
        }

        return acts.map((act) => {
            console.log('ActionDetails available', act.details)
            let actDescription = act.details.juriconnect ?
                <p><a href={'https://wetten.overheid.nl/' + act.details.juriconnect}>{act.act}</a></p>
                : <p>{act.act}</p>;
            return <div class="available">{actDescription}<button class="actButton" onClick={this.takeAction.bind(this, act.act)}>Act!</button></div>
        })
    }

    renderPotentialActs() {
        let acts = this.state.potentialActs
        if (!acts) {
            return []
        }

        return acts.map((act) => {
            let actDescription = act.details.juriconnect ?
                <p><a href={'https://wetten.overheid.nl/' + act.details.juriconnect}>{act.act}</a></p>
                : <p>{act.act}</p>;
            console.log('ActionDetails potential', act.details)
            return <div class="potential">{actDescription}<button class="actButton" onClick={this.takeAction.bind(this, act.act)}>Act!</button></div>
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
            return <li><p>{prevAct.act}</p></li>
        })
    }



    render() {
        return <div class="container">

            <div class="actorHeader" style={{'background-color': this.props.colorCode}}>
              <h3>{this.props.name}</h3>
            </div>
            <div class="acts">
                {this.renderAvailableActs()}
                {this.renderPotentialActs()}
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
