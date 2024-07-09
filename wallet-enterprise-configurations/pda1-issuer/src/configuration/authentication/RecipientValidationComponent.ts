import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import path from "path";
import fs from 'fs';
import crypto from 'node:crypto';
import { compactDecrypt } from "jose";
import locale from "../locale";


const currentWorkingDirectory = __dirname + "/../../../../";


var privateKeyFilePath;
var privateKeyContent;

privateKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'issuer.private.ecdh.json');
privateKeyContent = fs.readFileSync(privateKeyFilePath, 'utf8');
const credentialIssuerPrivateKeyJWK = JSON.parse(privateKeyContent) as crypto.JsonWebKey;
const credentialIssuerPrivateKey = crypto.createPrivateKey({ key: credentialIssuerPrivateKeyJWK, format: 'jwk' });



export class RecipientValidationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			await this.check(req, res, next);
		})
		.catch(() => {
			return next();
		});
	}


	


	private async check(req: Request, res: Response, next: NextFunction) {
		const { issuer_state } = req.authorizationServerState;
		if (!issuer_state) {
			throw new Error("Issuer state does not exist");
			
		}
		let { plaintext } = await compactDecrypt(issuer_state, credentialIssuerPrivateKey);
		const {
			sub, // authorized identities to receive this specific credential,
		} = JSON.parse(new TextDecoder().decode(plaintext)) as { iss: string, exp: number, jti: string, aud: string, sub: string[], nonce: string };
	
		if (req.authorizationServerState.personalIdentifier &&
				Array.isArray(sub) &&
				sub.includes(req.authorizationServerState.personalIdentifier)) {
			return next();
		}
		else if (req.authorizationServerState.personalIdentifier &&
			Array.isArray(sub) &&
			!sub.includes(req.authorizationServerState.personalIdentifier)) {
			req.session.authenticationChain = {}; // clear the session
			return res.render('issuer/reciepient-validation-component.pug', {
				title: "Invalid recipient",
				lang: req.lang,
				locale: locale[req.lang]
			})
			// render component which says that it is not eligible
		}
	}



}

			