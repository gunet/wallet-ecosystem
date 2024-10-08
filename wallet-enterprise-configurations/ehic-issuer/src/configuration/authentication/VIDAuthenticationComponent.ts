import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { VerifiablePresentationEntity } from "../../entities/VerifiablePresentation.entity";
import config from "../../../config";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GrantType } from "../../types/oid4vci";
import locale from "../locale";
import * as qrcode from 'qrcode';
import { openidForPresentationReceivingService, verifierConfigurationService } from "../../services/instances";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";
import { PresentationDefinitionTypeWithFormat } from "../verifier/VerifierConfigurationService";
import base64url from "base64url";

export class VIDAuthenticationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {

		return super.authenticate(req, res, async () => {
			if (this.personalIdentifierHasBeenExtracted(req)) {
				return next();
			}

			if (req.authorizationServerState.authenticationMethod &&
					req.authorizationServerState.authenticationMethod != UserAuthenticationMethod.VID_AUTH) {
				return next();
			}

			if (req.method == "GET" && req.query.state) {
				return this.handleCallback(req, res);
			}

			return this.askForPresentation(req, res);
		})
		.catch(() => {
			return next();
		});
	}

	private personalIdentifierHasBeenExtracted(req: Request): boolean {
		console.log("VID auth started")
		if (!req.session.authenticationChain.vidAuthenticationComponent?.personalIdentifier) {
			return false;
		}
		return true
	}

	private async checkForInvalidCredentials(vp_token: string): Promise<{ valid: boolean }> {
		const [_header, payload, _] = vp_token.split('.');
		const parsedPayload = JSON.parse(base64url.decode(payload)) as { vp: any };
		const credential = parsedPayload.vp.verifiableCredential[0];
		
		const [_credentialHeader, credentialPayload] = credential.split('.');

		const parsedCredPayload = JSON.parse(base64url.decode(credentialPayload)) as any;
		console.log("Parsed cred payload = ", parsedCredPayload)

		console.log("Exp = ", parsedCredPayload.exp)
		console.log("Now = ", Date.now() / 1000)
		if (parsedCredPayload.exp < (Date.now() / 1000)) {
			return { valid: false };
		}

		return { valid: true };
	}

	private async handleCallback(req: Request, res: Response): Promise<any> {

		const state = req.query.state as string; // find the vp based on the state

		const queryRes = await AppDataSource.getRepository(VerifiablePresentationEntity)
			.createQueryBuilder("vp")
			.where("vp.state = :state_id", { state_id: state })
			.getOne();
		if (!queryRes) {
			return;
		}
		const vp_token = queryRes.raw_presentation;

		const authorizationServerState = await AppDataSource.getRepository(AuthorizationServerState)
			.createQueryBuilder("state")
			.where("state.vid_auth_state = :vid_auth_state", { vid_auth_state: state })
			.getOne();

		if (!authorizationServerState || !vp_token || !queryRes.claims || !queryRes.claims["VID"] || !queryRes.raw_presentation) {
			return;
		}

		const { valid } = await this.checkForInvalidCredentials(queryRes.raw_presentation);
		if (!valid) {
			return await this.redirectToFailurePage(req, res, "Credential is expired");
		}
		const personalIdentifier = queryRes.claims["VID"].filter((claim) => claim.name == 'personalIdentifier')[0].value ?? null;
		if (!personalIdentifier) {
			return;
		}
		authorizationServerState.personalIdentifier = personalIdentifier;

		req.session.authenticationChain.vidAuthenticationComponent = {
			personalIdentifier: personalIdentifier
		};

		console.log("Personal identifier = ", personalIdentifier)
		req.authorizationServerState.personalIdentifier = personalIdentifier;

		await AppDataSource.getRepository(AuthorizationServerState).save(authorizationServerState);
		return res.redirect(this.protectedEndpoint);

	}


	private async redirectToFailurePage(_req: Request, res: Response, msg: string) {
		res.render('error', {
			code: 100,
			msg: msg,
			locale: locale,
		})
	}

	private async askForPresentation(req: Request, res: Response): Promise<any> {
		if (req.body.state && req.method == "POST") {
			console.log("Got state = ", req.body.state)
			const { status } = await openidForPresentationReceivingService.getPresentationByState(req.body.state as string);
			if (status) {
				return res.redirect(`${CONSENT_ENTRYPOINT}?state=${req.body.state}`);
			}
			else {
				return res.render('issuer/vid-auth-component', {
					state: req.body.state,
					authorizationRequestURL: req.body.authorizationRequestURL,
					authorizationRequestQR: req.body.authorizationRequestQR,
					lang: req.lang,
					locale: locale[req.lang],
				})
			}
		}


		const presentationDefinition = JSON.parse(JSON.stringify(verifierConfigurationService.getPresentationDefinitions().filter(pd => pd.id == "PID")[0])) as PresentationDefinitionTypeWithFormat;

		const { url, stateId } = await openidForPresentationReceivingService.generateAuthorizationRequestURL({req, res}, presentationDefinition, config.url + CONSENT_ENTRYPOINT);

		// attach the vid_auth_state with an authorization server state
		req.authorizationServerState.vid_auth_state = stateId;
		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		console.log("Authz state = ", req.authorizationServerState)
		if (req.authorizationServerState.grant_type && req.authorizationServerState.grant_type == GrantType.PRE_AUTHORIZED_CODE) {
			// render a page which shows a QR code and a button with the url for same device authentication

			let authorizationRequestQR = await new Promise((resolve) => {
				qrcode.toDataURL(url.toString(), {
					margin: 1,
					errorCorrectionLevel: 'L',
					type: 'image/png'
				}, 
				(err, data) => {
					if (err) return resolve("NO_QR");
					return resolve(data);
				});
			}) as string;
			return res.render('issuer/vid-auth-component', {
				title: "VID authentication",
				wwwalletURL: config.wwwalletURL,
				authorizationRequestURL: url.toString(),
				authorizationRequestQR: authorizationRequestQR,
				state: url.searchParams.get('state'),
				lang: req.lang,
				locale: locale[req.lang]
			});
		}
		return res.redirect(url.toString());
	}
	
	
}

