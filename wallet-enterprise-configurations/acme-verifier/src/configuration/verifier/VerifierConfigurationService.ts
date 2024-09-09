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
				"name": "First Name",
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"name": "Personal Identifier",
				"path": ['$.credentialSubject.personalIdentifier'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birthdate'],
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
				"name": "First Name",
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birthdate'],
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
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.credentialSubject.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.credentialSubject.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Id",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionCountryCode'],
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
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
      {
        "name": "Competent Institution Id",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionCountryCode'],
				"filter": {}
			},
			{
				"name": "Name of Employer",
				"path": ['$.credentialSubject.employer.name'],
				"filter": {}
			},
			{
				"name": "Employer Id",
				"path": ['$.credentialSubject.employer.employerId'],
				"filter": {}
			},
      {
				"name": "Place of Work Street",
				"path": ['$.credentialSubject.placeOfWork.street'],
				"filter": {}
			},
      {
				"name": "Place of Work Town",
				"path": ['$.credentialSubject.placeOfWork.town'],
				"filter": {}
			},
			{
				"name": "Place of Work Postal Code",
				"path": ['$.credentialSubject.placeOfWork.postalCode'],
				"filter": {}
			},
			{
				"name": "Place of Work Country Code",
				"path": ['$.credentialSubject.placeOfWork.countryCode'],
				"filter": {}
			},
			{
				"name": "Member State Legislation",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.decisionOnMSWhoseLegislationApplies.memberStateWhoseLegislationIsToBeApplied'],
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
				"name": "Place of work > country code",
				"path": ['$.credentialSubject.pda1_pow_country_code'],
				"filter": {}
			},
			{
				"name": "Place of work > company name",
				"path": ['$.credentialSubject.pda1_pow_company_name'],
				"filter": {}
			},
			{
				"name": "Place of work > company id",
				"path": ['$.credentialSubject.pda1_pow_company_id'],
				"filter": {}
			},
			{
				"name": "Place of work > type of id",
				"path": ['$.credentialSubject.pda1_pow_type_of_id'],
				"filter": {}
			},
			{
				"name": "Place of work > employer country code",
				"path": ['$.credentialSubject.pda1_pow_employer_country_code'],
				"filter": {}
			},
			{
				"name": "Place of work > employer street",
				"path": ['$.credentialSubject.pda1_pow_employer_street'],
				"filter": {}
			},
			{
				"name": "Place of work > employer town",
				"path": ['$.credentialSubject.pda1_pow_employer_town'],
				"filter": {}
			},
			{
				"name": "Place of work > employer postal code",
				"path": ['$.credentialSubject.pda1_pow_employer_postal_code'],
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
	"title": "Construction site permission",
	"description": "In order to enter the contrustion site, you will be asked to present your PID credential and an active PDA1 document (**data related to the place of work will be requested**)",
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
			// customVerifiableIdSdJwtPresentationDefinition,
			// customEHICSdJwtPresentationDefinition,
			// customPDA1SdJwtPresentationDefinition,
			scenarioOnePresentationDefinition,
			scenarioTwoPresentationDefinition
			// verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			// verifiableIdWithPda1PresentationDefinition,
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
