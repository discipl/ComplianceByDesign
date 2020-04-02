import React, { Component } from 'react';

class KvkForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            kvkNumber: "69599084",
            derivedFacts: null
        }
    }

    async query() {
        const result = await fetch("/api/v2/testprofile/companies?kvkNumber=" + this.state.kvkNumber)
        const data = await result.json()
        console.log(data)

        const companyInfo = data.data.items[0]


        const derivedFacts = {}
        // Default facts
        derivedFacts['[verzoek]'] = true


        derivedFacts['[datum van inschrijving van onderneming in het KVK Handelsregister]'] = companyInfo.registrationDate
        derivedFacts['[datum van oprichting van onderneming]'] = companyInfo.foundationDate
        
        derivedFacts['[aantal personen dat werkt bij onderneming]'] = companyInfo.employees


        // TODO: Check there is exactly one main activity SBI code
        const mainSbi = companyInfo.businessActivities
        .filter(activity => activity.isMainSbi)
        .map(activity => {
            const sbiWithoutDots = activity.sbiCode
            if (sbiWithoutDots.length > 4) {
                return sbiWithoutDots.substring(0, 2) + "." + sbiWithoutDots.substring(2, 4) + "." + sbiWithoutDots.substring(4)
            }
            if (sbiWithoutDots.length > 2) {
                return sbiWithoutDots.substring(0, 2) + "." + sbiWithoutDots.substring(2)
            }

            return sbiWithoutDots
        })

        // TODO: Remove hardcoded, because sample in API doesn't have right sbi code
        derivedFacts['[SBI-code hoofdactiviteit onderneming]'] = "47.19.2"

        const locatedInTheNetherlands = companyInfo.addresses
                .filter(address =>  address.type === 'vestigingsadres' && address.country === 'Nederland').length > 0

        
        derivedFacts["[onderneming heeft een fysieke vestiging in Nederland]"] = locatedInTheNetherlands
    

        this.setState({
            derivedFacts: derivedFacts
        })
    }

    handleChange(event) {    
        this.setState({kvkNumber: event.target.value})  
    }

    returnDerivedFacts() {
        if (this.props.handleDerivedFacts) {
            this.props.handleDerivedFacts(this.state.derivedFacts)
        }
    }

    render() {
        if (this.state.derivedFacts) {
            return (
                <div>
                    <p>{JSON.stringify(this.state.derivedFacts)}</p>
                    <button onClick={this.returnDerivedFacts.bind(this)}>Confirm</button>
                </div>
            )
        }
        return (
            <form onSubmit={this.query.bind(this)}>
            <input type="text" placeholder="KVK nummer" onChange={this.handleChange.bind(this)} value={this.state.kvkNumber}></input><input type="submit" value="Gegevens opsturen"/> 
          </form>
        )
    }
}

export default KvkForm