import React, {Component} from 'react';
import './ModelView.css';
import {LawReg} from "@discipl/law-reg";
import EphemeralConnector from "@discipl/core-ephemeral/src/EphemeralConnector";

import ActorView from './ActorView'

const timeoutPromise = (timeoutMillis) => {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve(), timeoutMillis)
    })
}

class ModelView extends Component {
  constructor(props) {
    super(props)

    this.lawReg = new LawReg()

    this.state = {
      'lb': this.props.model,
      'loading': true,
      'revert': false
    }
  }

  async componentDidMount() {
    console.log('ComponentDidMount', this.state.lb)
    await this.initialize(this.state.lb)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.model !== prevProps.model) {
      this.setState({
        ...this.state,
        'lb': this.props.model
      })
      await this.initialize(this.state.lb)

    }
  }

  async reset() {
    this.setState({'caseLink': this.needLink, 'revert': true})
  }

  async revert() {
    const core = this.lawReg.getAbundanceService().getCoreAPI()
    const caseState = await core.get(this.state.caseLink)

    const previousCaseLink = caseState.data['DISCIPL_FLINT_PREVIOUS_CASE']
    if (previousCaseLink) {
      this.setState({'caseLink': previousCaseLink, 'revert': true})
    }
  }


  async initialize(model) {
    console.log('Initializing with', model)
    this.setState({...this.state, 'loading': true})
    if (model == null) {
      console.log('Empty model, not initializing')
      this.setState({...this.state, 'loading': false})
    }
    // Wait to allow react to render before crypto stuff
    await timeoutPromise(1)
    console.log(new EphemeralConnector().getName())
    const core = this.lawReg.getAbundanceService().getCoreAPI()
    await core.registerConnector('ephemeral', new EphemeralConnector())

    let lawmakerSsid = await core.newSsid('ephemeral')
    await core.allow(lawmakerSsid)

    let leraarSsid = await core.newSsid('ephemeral')
    await core.allow(leraarSsid)
    let bestuursorgaanSsid = await core.newSsid('ephemeral')
    await core.allow(bestuursorgaanSsid)
    let bevoegdGezagSsid = await core.newSsid('ephemeral')
    await core.allow(bevoegdGezagSsid)

    this.modelLink = await this.lawReg.publish(lawmakerSsid, { ...model, 'model': 'LB' }, {
      '[persoon wiens belang rechtstreeks bij een besluit is betrokken]': 'IS:' + leraarSsid.did,
      '[degene die voldoet aan bevoegdheidseisen gesteld in]': 'IS:' + leraarSsid.did,
      '[artikel 3 van de Wet op het primair onderwijs]': 'IS:' + leraarSsid.did,
      '[artikel 3 van de Wet op de expertisecentra]': 'IS:' + leraarSsid.did,
      '[artikel XI van de Wet op de beroepen in het onderwijs]': 'IS:' + leraarSsid.did,
      '[artikel 3 van de Wet primair onderwijs BES]': 'IS:' + leraarSsid.did,
      '[is benoemd of tewerkgesteld zonder benoeming als bedoeld in artikel 33 van de Wet op het voortgezet onderwijs]': 'IS:' + leraarSsid.did,
      '[artikel 4.2.1. van de Wet educatie en beroepsonderwijs]': 'IS:' + leraarSsid.did,
      '[artikel 80 van de Wet voortgezet onderwijs BES]': 'IS:' + leraarSsid.did,
      '[artikel 4.2.1 van de Wet educatie beroepsonderwijs BES]': 'IS:' + leraarSsid.did,
      '[die lesgeeft in het hoger onderwijs]': 'IS:' + leraarSsid.did,
      '[orgaan]': 'IS:' + bestuursorgaanSsid.did,
      '[rechtspersoon die krachtens publiekrecht is ingesteld]': 'IS:' + bestuursorgaanSsid.did,
      '[met enig openbaar gezag bekleed]': 'IS:' + bestuursorgaanSsid.did,
      '[artikel 1 van de Wet op het primair onderwijs]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1 van de Wet op de expertisecentra]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1 van de Wet op het voortgezet onderwijs]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1.1.1., onderdeel w, van de Wet educatie en beroepsonderwijs]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1 van de Wet primair onderwijs BES]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1 van de Wet voortgezet onderwijs BES]': 'IS:' + bevoegdGezagSsid.did,
      '[artikel 1.1.1, van de Wet educatie en beroepsonderwijs BES]': 'IS:' + bevoegdGezagSsid.did,
      '[instellingsbestuur bedoeld in artikel 1.1, onderdeel j, van de Wet op het hoger onderwijs en wetenschappelijk onderzoek]': 'IS:' + bevoegdGezagSsid.did,
      '[minister van Onderwijs, Cultuur en Wetenschap]': 'IS:' + bestuursorgaanSsid.did,
      '[persoon]': 'ANYONE'
    })


    this.needSsid = await core.newSsid('ephemeral')

    await core.allow(this.needSsid)
    this.needLink = await core.claim(this.needSsid, {
      'need': {
        'act': '<<leraar vraagt subsidie voor studiekosten aan>>',
        'DISCIPL_FLINT_MODEL_LINK': this.modelLink
      }
    })

    this.setState({...this.state, 'leraarSsid': leraarSsid, 'bestuursorgaanSsid': bestuursorgaanSsid, 'caseLink': this.needLink, 'loading': false})
    console.log('State', this.state)
    console.log('Finished initialization')
    console.log('State', this.state)
  }


  onCaseChange(caseLink) {
    this.setState({...this.state, 'caseLink': caseLink, 'revert': false})
  }

  render() {
    console.log('ModelView render with state', this.state)
    if (this.state.loading === true) {
      console.log('View render loading true')
      return (<div><p>Loading...</p></div>)
    }
    return (
        <div>
        <div className='model-header'>
          <h1>
            Compliance by Design
          </h1>
          <button onClick={this.reset.bind(this)}>Reset</button>
          <button onClick={this.revert.bind(this)}>Undo</button>
        </div>
        <div className='grid-container'>
          <div>
            <ActorView lawReg={this.lawReg} actorSsid={this.state.leraarSsid} colorCode={"#0a0"} caseLink={this.state.caseLink} revert={this.state.revert} name={'Leraar'} onCaseChange={this.onCaseChange.bind(this)}/>
          </div>
          <div>
            <ActorView lawReg={this.lawReg} actorSsid={this.state.bestuursorgaanSsid} colorCode={"#229"} caseLink={this.state.caseLink} revert={this.state.revert} name={'Minister'} onCaseChange={this.onCaseChange.bind(this)}/>
          </div>
        </div>
        </div>
    );
  }
}

export default ModelView;
