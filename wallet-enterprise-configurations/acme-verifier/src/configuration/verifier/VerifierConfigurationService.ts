import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import { InputDescriptorType } from "@wwwallet/ssi-sdk";
import "reflect-metadata";

export type PresentationDefinitionTypeWithFormat = {
	title: string;
	description: string;
	id: string;
	format?: any;
	input_descriptors: InputDescriptorType[];
	selectable?: boolean;
};


const verifiableIdDescriptor =	{
	"id": "PID",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			},
			{
				"name": "Family Name",
				"path": ['$.credentialSubject.family_name'],
				"filter": {}
			},
			{
				"name": "Given Name",
				"path": ['$.credentialSubject.given_name'],
				"filter": {}
			},
			{
				"name": "Personal Identifier",
				"path": ['$.credentialSubject.personal_identifier'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birth_date'],
				"filter": {}
			}
		]
	}
}

const verifiableIdDescriptorWithFirstnameLastnameAndBirthdate =	{
	"id": "PID",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			},
			{
				"name": "Given Name",
				"path": ['$.credentialSubject.given_name'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.credentialSubject.family_name'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birth_date'],
				"filter": {}
			}
		]
	}
}



const europeanHealthInsuranceCardDescriptor = {
	"id": "EHIC",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'EuropeanHealthInsuranceCard' }
				}
			},
      {
				"name": "SSN",
				"path": ['$.credentialSubject.social_security_pin'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.validFrom'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.expirationDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.ehic_card_identification_number'],
				"filter": {}
			},
			{
				"name": "Competent Institution Id",
				"path": ['$.credentialSubject.ehic_institution_id'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.ehic_institution_name'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
				"path": ['$.credentialSubject.ehic_institution_country_code'],
				"filter": {}
			}
		]
	}
}


const Pda1Descriptor = {
	"id": "Pda1",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'PDA1Credential' }
				}
			},
			{
				"name": "SSN",
				"path": ['$.credentialSubject.social_security_pin'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.validFrom'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.expirationDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.pda1_document_id'],
				"filter": {}
			},
      {
        "name": "Competent Institution Id",
				"path": ['$.credentialSubject.pda1_institution_id'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.pda1_institution_name'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
				"path": ['$.credentialSubject.pda1_institution_country_code'],
				"filter": {}
			},
			{
				"name": "Name of Employer",
				"path": ['$.credentialSubject.pda1_name'],
				"filter": {}
			},
			{
				"name": "Employer Id",
				"path": ['$.credentialSubject.pda1_employer_id'],
				"filter": {}
			},
      {
				"name": "Place of Work Street",
				"path": ['$.credentialSubject.pda1_pow_employer_street'],
				"filter": {}
			},
      {
				"name": "Place of Work Town",
				"path": ['$.credentialSubject.pda1_pow_employer_town'],
				"filter": {}
			},
			{
				"name": "Place of Work Postal Code",
				"path": ['$.credentialSubject.pda1_pow_employer_postal_code'],
				"filter": {}
			},
			{
				"name": "Place of Work Country Code",
				"path": ['$.credentialSubject.pda1_pow_employer_country_code'],
				"filter": {}
			},
			{
				"name": "Member State Legislation",
				"path": ['$.credentialSubject.pda1_member_state'],
				"filter": {}
			}
		]
	}
}



// @ts-ignore
const verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithEuropeanHealthInsuranceCard",
	"title": "PID and EHIC",
	"description": "Required Fields: PID (firstName, familyName), EHIC (ssn, validityPeriod, documentId, competentInstitution)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptorWithFirstnameLastnameAndBirthdate,
		europeanHealthInsuranceCardDescriptor
	]
}

// const verifiableIdWithPda1WithEuropeanHealthInsuranceCardPresentationDefinition = {
// 	"id": "VerifiableIdWithBachelorWithEuropeanHealthInsuranceCard",
// 	"title": "PID, European Health Insurance Card and PDA1",
// 	"description": "Required Fields: PID (firstName, familyName), EHIC (ssn, validityPeriod, documentId, competentInstitution), PDA1 (ssn, validityPeriod, documentId, competentInstitution, employerInfo)",
// 	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
// 	"input_descriptors": [
// 		verifiableIdDescriptorWithFirstnameLastname,
// 		europeanHealthInsuranceCardDescriptor,
// 		Pda1Descriptor,
// 	]
// }

// @ts-ignore
const verifiableIdWithPda1PresentationDefinition = {
	"id": "PIDWithPda1",
	"title": "PID and PDA1",
	"description": "Required Fields: PID (firstName, familyName), PDA1 (ssn, validityPeriod, documentId, competentInstitution, employerInfo)",
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptorWithFirstnameLastnameAndBirthdate,
		Pda1Descriptor,
	]


}

// @ts-ignore
const customVerifiableIdSdJwtPresentationDefinition = {
	"id": "CustomPID",
	"title": "Custom PID",
	"description": "Selectable Fields: personalIdentifier, firstName, familyName, birthdate",
	"selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
	]
}

// @ts-ignore
const customEHICSdJwtPresentationDefinition = {
	"id": "CustomEHIC",
	"title": "Custom EHIC",
	"description": "Selectable Fields:...",
	"selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		europeanHealthInsuranceCardDescriptor
	]
}

// @ts-ignore
const customPDA1SdJwtPresentationDefinition = {
	"id": "CustomPDA1",
	"title": "Custom PDA1",
	"description": "Selectable Fields:...",
	"selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		Pda1Descriptor
	]
}


const scenarioOnePidPart = {
	"id": "PID",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			},
			{
				"name": "Family Name",
				"path": ['$.credentialSubject.family_name'],
				"filter": {}
			},
			{
				"name": "Given Name",
				"path": ['$.credentialSubject.given_name'],
				"filter": {}
			},
			{
				"name": "Personal Identifier",
				"path": ['$.credentialSubject.personal_identifier'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birth_date'],
				"filter": {}
			}
		]
	}
}

const scenarioOneEhicPart = {
	"id": "EHIC",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'EuropeanHealthInsuranceCard' }
				}
			},
			{
				"name": "Starting Date",
				"path": ['$.validFrom'],
				"filter": {}
			},
			{
				"name": "Expiration Date",
				"path": ['$.expirationDate'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country",
				"path": ['$.credentialSubject.ehic_institution_country_code'],
				"filter": {}
			},
		]
	}
}

const scenarioTwoPda1Part = {
	"id": "PDA1",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'PDA1Credential' }
				}
			},
			{
				"name": "Starting Date",
				"path": ['$.validFrom'],
				"filter": {}
			},
			{
				"name": "Expiration Date",
				"path": ['$.expirationDate'],
				"filter": {}
			},
			{
				"name": "Place of word Street",
				"path": ['$.credentialSubject.pda1_pow_employer_street'],
				"filter": {}
			},
			{
				"name": "Place of word Town",
				"path": ['$.credentialSubject.pda1_pow_employer_town'],
				"filter": {}
			},
			{
				"name": "Place of work Employer Postal Code",
				"path": ['$.credentialSubject.pda1_pow_employer_postal_code'],
				"filter": {}
			},
			{
				"name": "Place of work Employer Country Code",
				"path": ['$.credentialSubject.pda1_pow_employer_country_code'],
				"filter": {}
			},

		]
	}
}

const scenarioOnePresentationDefinition = {
	"id": "ScenarioOne",
	"title": "Apply for Masters studies",
	"description": "In order to apply for Masters studies, you will be asked to present your PID credential and an active European Health Insurance Card from your home country (**only country will be requested**) ",
	"selectable": false,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		scenarioOnePidPart,
		scenarioOneEhicPart
	]
}

const scenarioTwoPresentationDefinition = {
	"id": "ScenarioTwo",
	"title": "Work site permission",
	"description": "In order to enter the work site, you will be asked to present your PID credential and an active PDA1 document (**data related to the place of work will be requested**)",
	"selectable": false,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		scenarioOnePidPart,
		scenarioTwoPda1Part,
	]
}


@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [
			customVerifiableIdSdJwtPresentationDefinition,
			// customEHICSdJwtPresentationDefinition,
			// customPDA1SdJwtPresentationDefinition,
			scenarioOnePresentationDefinition,
			scenarioTwoPresentationDefinition,
			verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			verifiableIdWithPda1PresentationDefinition,
			// verifiableIdWithPda1WithEuropeanHealthInsuranceCardPresentationDefinition
		]
	}


	getConfiguration(): OpenidForPresentationsConfiguration {
		return {
			baseUrl: config.url,
			client_id: authorizationServerMetadataConfiguration.authorization_endpoint,
			redirect_uri: config.url + "/verification/direct_post",
			authorizationServerWalletIdentifier: "authorization_server",
		}
	}

}
