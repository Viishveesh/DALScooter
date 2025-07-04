import json
import boto3
import os
import logging

# --- Setup ---
dynamodb = boto3.client('dynamodb')
table_name = os.environ['DYNAMODB_TABLE']
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Main Handler ---
def lambda_handler(event, context):
    logger.info(f"Event Received: {json.dumps(event)}")

    trigger = eventChallenge_Authentication":
        # First custom challenge: Security Question & Answer
        if len(session) == 0:
            try:
                db_response = dynamodb.get_item(
                    TableName=table_name,
                    Key={'userId': {'S': str(user_id)}}
                )
                item = db_response.get('Item', {})
                question = item['securityQuestion']['S']
                answer = item['securityAnswer']['S']

                response['publicChallengeParameters'] = {'question': question}
                response['privateChallengeParameters'] = {'answer': answer}

            except Exception as e:
                logger.error(f"Failed to fetch Q&A for user {user_id}: {e}")
                raise e
        # Second custom challenge: Caesar Cipher
        elif len(session) == 1:
            plain_text = "HALIFAX" # Use a consistent word for the project
            shift = 3
            # Simple Caesar cipher implementation for uppercase letters
            cipher_text = ''.join([chr(((ord(c) - 65 + shift) % 26) + 65) for c in plain_text.upper()])

            response['publicChallengeParameters'] = { 'clue': f'Decrypt the word: {cipher_text}' }
            response['privateChallengeParameters'] = { 'answer': plain_text }

    # PHASE 3: Verify the user's answer.
    elif trigger == "VerifyAuthChallengeResponse_Authentication":
        expected = event['request']['privateChallengeParameters']['answer'].strip().upper()
        user_response = event['request']['challengeAnswer'].strip().upper()

        response['answerCorrect'] = (expected == user_response)

    event['response'] = response
    logger.info(f"Event Response: {json.dumps(event)}")
    return event