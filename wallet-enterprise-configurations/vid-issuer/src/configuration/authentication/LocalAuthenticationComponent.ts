import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import locale from "../locale";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";
import { parsePidData } from 'dataset-reader';

export class LocalAuthenticationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
		private users: any[] = []
	) {
		super(identifier, protectedEndpoint);
		const data = parsePidData("/datasets/dataset.xlsx");
		console.log("Raw pid_expiry_date = ", data[0].pid_expiry_date)
		console.log("Converted to unix timestamp = ", Math.floor(new Date(data[0].pid_expiry_date).getTime() / 1000) )
		console.log("Birthdate = ", data[0].birth_date)
		console.log("Columns of first row");
		console.log(Object.keys(data[0]));
		this.users = data as any[];
	}

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.isAuthenticated(req)) {
				return next();
			}

			if (req.authorizationServerState.authenticationMethod &&
				req.authorizationServerState.authenticationMethod != UserAuthenticationMethod.SSO) {
					
				return next();
			}
	
			if (req.method == "POST") {
				return this.handleLoginSubmission(req, res);
			}
	
			return this.renderLogin(req, res);
		})
		.catch(() => {
			return next();
		});
	}


	
	private async isAuthenticated(req: Request): Promise<boolean> {
		if (!req.session.authenticationChain?.localAuthenticationComponent?.username) {
			return false;
		}
		// const username = req.session.authenticationChain.localAuthenticationComponent.username;
		// if (!username || this.users.filter((u: any) => u.User == username).length != 1) return false;

		// const usersFound = this.users.filter((u: any) => u.User == username) as any;
		// req.authorizationServerState.personalIdentifier = usersFound[0].pid_id;
		// await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		return true;
	}

	private async renderLogin(req: Request, res: Response): Promise<any> {
		res.render('issuer/login', {
			title: "Login",
			lang: req.lang,
			locale: locale[req.lang]
		})
	}

	private async renderFailedLogin(req: Request, res: Response): Promise<any> {
		res.render('issuer/login', {
			title: "Login",
			lang: req.lang,
			locale: locale[req.lang],
			failed: true
		})
	}

	private async handleLoginSubmission(req: Request, res: Response): Promise<any> {
		const { username, password } = req.body;
		const usersFound = this.users.filter((u: any) => u.User == username && u.Password == password);
		if (usersFound.length == 1) {
			// sign a token and send it to the client

			req.session.authenticationChain.localAuthenticationComponent = {
				username: username
			};

			req.authorizationServerState.family_name = (usersFound[0] as any).family_name;
			req.authorizationServerState.given_name = (usersFound[0] as any).given_name;
			req.authorizationServerState.birth_date = new Date((usersFound[0] as any).birth_date).toISOString();
			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderFailedLogin(req, res);
		}
	}
}


