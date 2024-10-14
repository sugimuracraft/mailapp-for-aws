// function name: SaintSouthMailService-RetrieveEmail

import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({region: process.env['S3_REGION']});
const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const mailDomainName = process.env['MAIL_DOMAIN_NAME'];
const mailDomainNameSuffix = `@${mailDomainName}`;

const bucketName = process.env['S3_BUCKET_NAME'];
const USERS_PREFIX = 'users/';
const NEW_DIR = 'new';
const READ_DIR = 'read';
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
    return response.Items[0];
};

const readEmailBody = async (email) => {
    const response = await s3Client.send(
        new GetObjectCommand({
            Bucket: bucketName,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
        })
    );
    const body = await response.Body.transformToString();
    return body;
};

const updateStatus = async (email) => {
    const response = await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                user: email.user,
                receivedAt: email.receivedAt,
            },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': READ_DIR,
            },
            ReturnValues: 'ALL_NEW',
        })
    );
    return response.Attributes;
};

const moveToRead = async (email) => {
    await s3Client.send(
        new CopyObjectCommand({
            CopySource: `/${bucketName}/${USERS_PREFIX}${email.user}/${NEW_DIR}/${email.messageId}`,
            Bucket: bucketName,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
        })
    );
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `${USERS_PREFIX}${email.user}/${NEW_DIR}/${email.messageId}`,
        })
    );
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
    const body = await readEmailBody(email);
    if (email.status === NEW_DIR) {
        email = await updateStatus(email);
        await moveToRead(email);
    }
    email["body"] = body;
    return email;
};
