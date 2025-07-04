import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def handler(event, context):
    try:
        body = json.loads(event['body'])
        user_id = body['userId']
        question = body['question']
        answer = body['answer']

        table.put_item(Item={
            'userId': user_id,
            'securityQuestion': question,
            'securityAnswer': answer
        })

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Q&A stored successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
