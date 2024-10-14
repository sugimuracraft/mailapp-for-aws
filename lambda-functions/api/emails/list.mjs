// function name: SaintSouthMailService-ListEmails

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const mailDomainName = process.env["MAIL_DOMAIN_NAME"]
const mailDomainNameSuffix = `@${mailDomainName}`;
const tableName = process.env["DYNAMODB_TABLE_NAME"];

export const handler = async (event) => {
    if (!event.context.email.endsWith(mailDomainNameSuffix)) {
        throw new Error('Unknown domain\'s mail.');
    }
    const user = event.context.email.replace(mailDomainNameSuffix, '');
    const params = {
        TableName: tableName,
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
