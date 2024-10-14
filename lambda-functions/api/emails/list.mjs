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
        ScanIndexForward: false,  // 降順で取得（新しいものから）
        ConsistentRead: false,
    };
    if ('k' in event.params.querystring) {
        params['ExclusiveStartKey'] = {
            user: user,
            receivedAt: event.params.querystring.k,
        };
    }
    const data = await docClient.send(new QueryCommand(params));
    const response = {
        statusCode: 200,
        body: JSON.stringify(data),
    };
    return response;
};
