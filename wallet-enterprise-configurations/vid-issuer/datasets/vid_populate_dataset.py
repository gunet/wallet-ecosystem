import pandas as pd
import json
import random
import string
import sys

# Function to generate a random reference ID
def generate_random_id(k=10):
		return int(''.join(random.choices(string.digits, k=k)))


def create_json_from_excel(excel_file_path):
		# Read Excel file into pandas DataFrame
		df = pd.read_excel(excel_file_path, sheet_name="PID", header=1)

		# Initialize list to store user data
		users = []

		# Iterate through each row in the DataFrame
		for index, row in df.iterrows():
				print(row)
				username = (row['email-adress'].split('@')[0]).lower()
				password = username
				uid = str(row['pid_id'])
				personal_identifier = str(row['social_security_pin'])
				first_name = row['given_name']
				family_name = row['family_name']
				birth_date = str(row['birth_date'].strftime('%Y-%m-%d'))
				pid_expiry_date = str(row['pid_expiry_date'])
				reference_id = str(generate_random_id())

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
								"referenceId": reference_id,
								"validityPeriod": {
									"startingDate": "2024-02-02",
									"endingDate": pid_expiry_date
								}
						}
				}

				# Append user data to the list
				users.append(user_data)
				df.at[index, 'personalIdentifier'] = personal_identifier

		# Construct final JSON structure
		json_data = {"users": users}

		# Write JSON data to a file
		output_file_path = excel_file_path.replace('.xlsx', '_output.json')
		with open(output_file_path, 'w') as f:
				json.dump(json_data, f, indent=4)
		
		df.to_excel(excel_file_path, index=False)

		print("JSON file created successfully at:", output_file_path)

if __name__ == "__main__":
		if len(sys.argv) != 2:
				print("Usage: python script.py <excel_file_path>")
				sys.exit(1)

		excel_file_path = sys.argv[1]
		create_json_from_excel(excel_file_path)
