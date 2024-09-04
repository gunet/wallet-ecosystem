import pandas as pd
import json
import random
import string
import sys

def create_json_from_excel(excel_file_path):
		# Read Excel file into pandas DataFrame
		df = pd.read_excel(excel_file_path, sheet_name="EHIC", header=0)
		# Initialize list to store user data
		users = []

		# Iterate through each row in the DataFrame
		for index, row in df.iterrows():
				username = (row['email-adress'].split('@')[0]).lower()
				password = username
				uid = str(row['pid_id'])
				personal_identifier = str(row['social_security_pin'])
				first_name = row['given_name']
				family_name = row['family_name']
				ssn = str(row['social_security_pin'])
				birth_date = str(row['birth_date'].strftime('%Y-%m-%d'))
				documentId = str(int(row['ehic_card_identification_number']))
				startingDate = str(row['ehic_start_date'])
				endingDate = str(row['ehic_end_date'])
				competentInstitutionId = row['ehic_institution_id']
				competentInstitutionName = row['ehic_institution_name']
				competentInstitutionCountryCode = row['ehic_institution_country_code_']


				# Construct user dictionary
				user_data = {
						"authentication": {
								"username": username,
								"password": password,
								"uid": uid,
								"personalIdentifier": personal_identifier
						},
						"claims": {
							"firstName": first_name,
							"familyName": family_name,
							"birthdate": birth_date,
							"personalIdentifier": personal_identifier,
							"socialSecurityIdentification": {
								"ssn": ssn
							},
							"validityPeriod": {
								"startingDate": startingDate,
								"endingDate": endingDate
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
