import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { appContainer } from "../../services/inversify.config";
import { CredentialIssuersConfigurationService } from "../CredentialIssuersConfigurationService";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";


export class AuthenticationMethodSelectionComponent extends AuthenticationComponent {
	credentialIssuersConfigurationService = appContainer.resolve(CredentialIssuersConfigurationService);

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.hasSelectedAuthenticationMethod(req)) {
				return next();
			}
			return this.handleAuthenticationMethodSelection(req, res);	
		})
		.catch(() => {
			return next();
		});
	}


	
	private async hasSelectedAuthenticationMethod(req: Request): Promise<boolean> {
		if (!req.session.authenticationChain?.authenticationMethodSelectionComponent?.authentication_method) {
			return false;
		}
		return true;
	}

	private async handleAuthenticationMethodSelection(req: Request, res: Response): Promise<any> {
		const auth_method = UserAuthenticationMethod.VID_AUTH;

		req.session.authenticationChain.authenticationMethodSelectionComponent = {
			authentication_method: auth_method
		};

		req.authorizationServerState.authenticationMethod = auth_method;

		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		return res.redirect(this.protectedEndpoint);
	}
}

			