import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialStatusList } from "../../lib/CredentialStatus";
import { parsePidData } from 'dataset-reader';

export class VIDSupportedCredentialSdJwt implements SupportedCredentialProtocol {


  constructor(private credentialIssuerConfig: CredentialIssuer) { }

  getCredentialIssuerConfig(): CredentialIssuer {
    return this.credentialIssuerConfig;
  }
  getId(): string {
    return "urn:credential:vid"
  }
  getFormat(): VerifiableCredentialFormat {
    return VerifiableCredentialFormat.VC_SD_JWT;
  }
  getTypes(): string[] {
    return ["VerifiableCredential", "VerifiableAttestation", "VerifiableId", this.getId()];
  }
  getDisplay(): Display {
		return {
			name: "PID",
			logo: { url: config.url + "/images/vidCard.png" },
			background_color: "#4CC3DD"
		}
  }


  async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
    if (!userSession?.personalIdentifier) {
      return null;
    }

		const dataset = parsePidData("/datasets/dataset.xlsx");
		const vids = dataset.filter((user: any) => user.pid_id == userSession.personalIdentifier);
		const credentialViews: CredentialView[] = vids
			.map((vid: any) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: vid.family_name },
					{ name: "Given Name", value: vid.given_name },
					{ name: "Personal Identifier", value: vid.pid_id },
					{ name: "Date of Birth", value: (vid.birth_date as Date).toDateString() },
					{ name: "Expiration Date", value: new Date(vid.pid_expiry_date).toDateString() },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };
				
				return {
					credential_id: this.getId(),
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					deferredFlow: false,
				}
			})
		return credentialViews[0];
  }
  
  async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any;  }> {
		if (!userSession.personalIdentifier) {
			throw new Error("Cannot generate credential: Taxis id is missing");
		}
		

		const dataset = parsePidData("/datasets/dataset.xlsx");
		const data = dataset.filter((user: any) => user.pid_id == userSession.personalIdentifier)[0];
		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:vid:${randomUUID()}`,
			"name": "PID",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National PID credential issuer and it can be used for authentication purposes",
			"credentialSubject": {
				family_name: data.family_name,
				given_name: data.given_name,
				birth_date: data.birth_date,
				personal_identifier: String(data.pid_id),
				"id": holderDID,
			},
			"credentialStatus": {
				"id": `${config.crl.url}#${(await CredentialStatusList.insert(data.User, data.pid_id)).id}`,
				"type": "CertificateRevocationList"
			},
			"credentialBranding": {
				"image": {
					"url": config.url + "/images/vidCard.png"
				},
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
			"credentialSchema": {
				"id": "https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/z8Y6JJnebU2UuQQNc2R8GYqkEiAMj3Hd861rQhsoNWxsM",
				"type": "JsonSchema",
			}
		};

		const disclosureFrame = {
			vc: {
				credentialSubject: {
					family_name: true,
					given_name: true,
					birth_date: true,
					personal_identifier: true,
				}
			}
		}
		const { jws } = await this.getCredentialIssuerConfig().getCredentialSigner()
			.sign({
				vc: payload
			}, {}, disclosureFrame, { exp: Math.floor(new Date(data.pid_expiry_date).getTime() / 1000) });
    const response = {
      format: this.getFormat(),
      credential: jws
    };

    return response;
  }

	exportCredentialSupportedObject(): CredentialSupportedJwtVcJson {
		return {
			id: this.getId(),
			format: this.getFormat(),
			display: [ this.getDisplay() ],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

