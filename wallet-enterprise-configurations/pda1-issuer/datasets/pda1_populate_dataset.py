import pandas as pd
import json
import random
import string
import sys

# Function to generate a random reference ID
def generate_document_id():
		return ''.join(random.choices(string.digits, k=20))

def create_json_from_excel(excel_file_path):
		# Read Excel file into pandas DataFrame
		df = pd.read_excel(excel_file_path, sheet_name="PDA1", header=0)

		# Initialize list to store user data
		users = []

		# Iterate through each row in the DataFrame
		for index, row in df.iterrows():
				print(row)
				username = (row['email-adress'].split('@')[0]).lower()
				email = row['email-adress']
				password = username
				uid = str(row['pid_id'])
				first_name = row['given_name']
				family_name = row['family_name']
				personal_identifier = str(row['social_security_pin'])
				
				ssn = str(row['social_security_pin'])
				birth_date = str(row['birth_date'].strftime('%Y-%m-%d'))
				documentId = str(row['pda1_document_id'])
				startingDate = str(row['pda1_starting_date'])
				endingDate = str(row['pda1_ending_date'])
				competentInstitutionId = row['pda1_institution_id']
				competentInstitutionName = row['pda1_institution_name']
				competentInstitutionCountryCode = row['pda1_institution_country_code_']

				nationalityCode = row['nationality']
				employmentType = row['type_of_employment ']
				name = row['pda1_name ']
				employerId = row['pda1_employer_id']
				typeOfId = row['pda1_type_of_id']

				street = row['pda1_employer_Street']
				town = row['pda1_employer_town']
				postalCode = str(row['pda1_employer_postal_code'])
				countryCode = row['pda1_employer_country_ code']

				pow_companyName = row['pda1_pow_company_name ']
				# pow_flagBaseHomeState = row['pda1_flag_base_home_state']
				pow_companyId = row['pda1_pow_company_id']
				pow_typeOfId = row['pda1_pow_type_ of_id ']
				pow_street = row['pda1_pow_employer_street']
				pow_town = row['pda1_pow_employer_town']
				pow_postalCode = str(row['pda1_pow_employer_postal_code'])
				pow_countryCode = row['pda1_pow_employer_country_code']

				memberStateWhoseLegislationIsToBeApplied = row['pda1_member_state']
				transitionalRulesApplyAsPerTheRegulation = row['pda1_transitional_rules']

				statusCode = row['pda1_status_confirmation']


				# Construct user dictionary
				user_data = {
					"authentication": {
						"username": username,
						"password": password,
						"uid": uid,
						"personalIdentifier": personal_identifier,
						"email": email
					},
					"claims": {
						"firstName": first_name,
						"familyName": family_name,
						"birthdate": birth_date,
						"personalIdentifier": personal_identifier,
						"socialSecurityIdentification": {
							"ssn": ssn
						},

						"nationality": {
							"nationalityCode": nationalityCode
						},
						"employer": {
							"employmentType": employmentType,
							"name": name,
							"employerId": employerId,
							"typeOfId": typeOfId
						},
						"address": {
							"street": street,
							"town": town,
							"postalCode": postalCode,
							"countryCode": countryCode
						},
						"placeOfWork": {
							"companyName": pow_companyName,
							"flagBaseHomeState": "",
							"companyId": pow_companyId,
							"typeOfId": pow_typeOfId,
							"street": pow_street,
							"town": pow_town,
							"postalCode": pow_postalCode,
							"countryCode": pow_countryCode
						},
						"decisionOnApplicableLegislation": {
							"decisionOnMSWhoseLegislationApplies": {
								"memberStateWhoseLegislationIsToBeApplied": memberStateWhoseLegislationIsToBeApplied,
								"transitionalRulesApplyAsPerTheRegulation": transitionalRulesApplyAsPerTheRegulation
							},
							"validityPeriod": {
								"startingDate": startingDate,
								"endingDate": endingDate
							},
						},
						"statusConfirmation": {
							"statusCode": statusCode
						},
						"documentId": documentId,
						"competentInstitution": {
							"competentInstitutionId": competentInstitutionId,
							"competentInstitutionName": competentInstitutionName,
							"competentInstitutionCountryCode": competentInstitutionCountryCode
						}
					}			

				}

				# Append user data to the list
				users.append(user_data)

		# Construct final JSON structure
		json_data = {"users": users}

		# Write JSON data to a file
		output_file_path = excel_file_path.replace('.xlsx', '_output.json')
		with open(output_file_path, 'w') as f:
				json.dump(json_data, f, indent=4)

		print("JSON file created successfully at:", output_file_path)

if __name__ == "__main__":
		if len(sys.argv) != 2:
				print("Usage: python script.py <excel_file_path>")
				sys.exit(1)

		excel_file_path = sys.argv[1]
		create_json_from_excel(excel_file_path)
