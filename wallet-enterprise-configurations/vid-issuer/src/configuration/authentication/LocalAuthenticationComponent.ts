import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { SignJWT, jwtVerify } from "jose";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import config from "../../../config";
import locale from "../locale";
import fs from 'fs';

export class LocalAuthenticationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
		private secret = config.appSecret,
		private users = []
	) {
		super(identifier, protectedEndpoint)
		const dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any;
		console.dir(dataset, { depth: null })
		this.users = dataset.users;
	}

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.isAuthenticated(req)) {
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
		const jws = req.cookies['jws'];
		if (!jws) {
			return false;
		}
		return await jwtVerify(jws, new TextEncoder().encode(this.secret)).then(async (result) => {
			const username = result.payload.sub;
			if (!username || this.users.filter((u: any) => u.authentication.username == username).length != 1) return false;

			const usersFound = this.users.filter((u: any) => u.authentication.username == username);
			req.authorizationServerState.personalIdentifier = (usersFound[0] as any).authentication.personalIdentifier;
			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return true;
		}).catch(err => {
			console.error(err);
			return false;
		})
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
		const usersFound = this.users.filter((u: any) => u.authentication.username == username && u.authentication.password == password);
		if (usersFound.length == 1) {
			// sign a token and send it to the client

			const jws = await new SignJWT({})
				.setSubject(username)
				.setProtectedHeader({ alg: 'HS256' })
				.setIssuedAt()
				.setExpirationTime('1h')
				.sign(new TextEncoder().encode(this.secret));
			res.cookie('jws', jws);

			req.authorizationServerState.personalIdentifier = (usersFound[0] as any).authentication.personalIdentifier;
			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderFailedLogin(req, res);
		}
	}
}