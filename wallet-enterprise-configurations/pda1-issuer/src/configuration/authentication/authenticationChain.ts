import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { IssuerSelectionComponent } from "./IssuerSelectionComponent";
import { AuthenticationMethodSelectionComponent } from "./AuthenticationMethodSelectionComponent";
import { VIDAuthenticationComponent } from "./VIDAuthenticationComponent";
import { RecipientValidationComponent } from './RecipientValidationComponent';

export const authChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new AuthenticationMethodSelectionComponent("auth-method", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new VIDAuthenticationComponent("vid-authentication", CONSENT_ENTRYPOINT))
	// .addAuthenticationComponent(new LocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new RecipientValidationComponent("3-recipient-validation", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new IssuerSelectionComponent("2-issuer-selection", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();