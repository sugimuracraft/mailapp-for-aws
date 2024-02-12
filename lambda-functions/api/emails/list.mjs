// function name: SaintSouthMailService-ListEmails

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const MY_DOMAIN_NAME = 'saintsouth.net';

const TABLE_NAME = 'mailbox';

export const handler = async (event) => {
    if (!event.context.email.endsWith(`@${MY_DOMAIN_NAME}`)) {
        throw new Error('Unknown domain\'s mail.');
    }
    const user = event.context.email.replace(`@${MY_DOMAIN_NAME}`, '');
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#user = :user',
        ExpressionAttributeNames: {
            '#user': 'user',
        },
        ExpressionAttributeValues: {
            ':user': user,
        },
        Limit: 50,
        ConsistentRead: false,
    };
    if ('k' in event.params.querystring) {
        params['ExclusiveStartKey'] = {
            user: user,
            receivedAt: event.params.querystring.k,
        };
    }
    return await docClient.send(new QueryCommand(params));
};
