// function name: SaintSouthMailService-DeleteEmail

import {
    DeleteObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({region: process.env['S3_REGION']});
const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const mailDomainName = process.env['MAIL_DOMAIN_NAME'];
const mailDomainNameSuffix =`@${mailDomainName}`;

const bucketName = process.env['S3_BUCKET_NAME'];
const USERS_PREFIX = 'users/';
const tableName = process.env['DYNAMODB_TABLE_NAME'];

const retrieveEmail = async (messageId) => {
    const response = await docClient.send(
        new QueryCommand({
            TableName: tableName,
            IndexName: 'messageId-index',
            KeyConditionExpression: '#messageId = :messageId',
            ExpressionAttributeNames: {
                '#messageId': 'messageId',
            },
            ExpressionAttributeValues: {
                ':messageId': messageId,
            },
            Limit: 1,
            ConsistentRead: false,
        })
    );
    console.log(`message retrieved ${messageId}`);
    return response.Items[0];
};

const deleteEmail = async (email) => {
    await docClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: {
                user: email.user,
                receivedAt: email.receivedAt,
            },
        })
    );
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
        })
    );
    console.log(`message deleted ${email.messageId}`);
    return {
        email: email,
        Bucket: bucketName,
        Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
    };
};

export const handler = async (event) => {
    if (!event.context.email.endsWith(mailDomainNameSuffix)) {
        throw new Error(`Unknown domain\'s mail. (email: ${event.context.email})`);
    }
    const user = event.context.email.replace(mailDomainNameSuffix, '');
    let email = await retrieveEmail(event.params.path.messageId);
    if (email.user !== user) {
        console.info();
        throw new Error(`Unknown messageId. email.user (${email.user}) !== user (${user})`);
    }
    const data = deleteEmail(email);
    const response = {
        statusCode: 200,
        body: JSON.stringify(data),
    };
    return response;
};
