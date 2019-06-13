import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {LawReg} from "@discipl/law-reg";
import EphemeralConnector from "@discipl/core-ephemeral/src/EphemeralConnector";
import lb from './model/lerarenbeurs'
import ActorView from './ActorView'

class App extends Component {
  constructor(props) {
    super(props)

    this.lawReg = new LawReg()

    this.state = {}
  }
  async componentDidMount() {
    console.log(new EphemeralConnector().getName())
    const core = this.lawReg.getAbundanceService().getCoreAPI()
    await core.registerConnector('ephemeral', new EphemeralConnector())

    let lawmakerSsid = await core.newSsid('ephemeral')
    await core.allow(lawmakerSsid)

    let leraarSsid = await core.newSsid('ephemeral')
    await core.allow(leraarSsid)
    let bestuursorgaanSsid = await core.newSsid('ephemeral')
    await core.allow(bestuursorgaanSsid)

    this.modelLink = await this.lawReg.publish(lawmakerSsid, { ...lb, 'model': 'LB' }, {
      '[persoon wiens belang rechtstreeks bij een besluit is betrokken]': 'IS:' + leraarSsid.did,
      '[leraar]': 'IS:' + leraarSsid.did,
      '[orgaan]': 'IS:' + bestuursorgaanSsid.did,
      '[rechtspersoon die krachtens publiekrecht is ingesteld]': 'IS:' + bestuursorgaanSsid.did,
      '[met enig openbaar gezag bekleed]': 'IS:' + bestuursorgaanSsid.did,
      '[bevoegd gezag]': 'IS:' + bestuursorgaanSsid.did,
      '[minister van Onderwijs, Cultuur en Wetenschap]': 'IS:' + bestuursorgaanSsid.did,
      '[persoon]': 'ANYONE'
    })


    let needSsid = await core.newSsid('ephemeral')

    await core.allow(needSsid)
    let caseLink = await core.claim(needSsid, {
      'need': {
        'act': '<<leraar vraagt subsidie voor studiekosten aan>>',
        'DISCIPL_FLINT_MODEL_LINK': this.modelLink
      }
    })

    this.setState({...this.state, 'leraarSsid': leraarSsid, 'bestuursorgaanSsid': bestuursorgaanSsid, 'caseLink': caseLink})

  }

  onCaseChange(caseLink) {
    this.setState({...this.state, 'caseLink': caseLink})
  }

  render() {
    return (
        <div class='grid-container'>
          <div>
            <ActorView lawReg={this.lawReg} actorSsid={this.state.leraarSsid} caseLink={this.state.caseLink} name={'Leraar'} onCaseChange={this.onCaseChange.bind(this)}/>
          </div>
          <div>
            <ActorView lawReg={this.lawReg} actorSsid={this.state.bestuursorgaanSsid} caseLink={this.state.caseLink} name={'Minister'} onCaseChange={this.onCaseChange.bind(this)}/>
          </div>
        </div>
    );
  }
}

export default App;
