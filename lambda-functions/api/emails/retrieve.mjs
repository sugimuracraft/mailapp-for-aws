// function name: SaintSouthMailService-RetrieveEmail

import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({region: 'us-west-2'});
const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const MY_DOMAIN_NAME = 'saintsouth.net';

const BUCKET_NAME = "mailbox.saintsouth.net";
const USERS_PREFIX = 'users/';
const NEW_DIR = 'new';
const READ_DIR = 'read';
const TABLE_NAME = 'mailbox';

const retrieveEmail = async (messageId) => {
    const response = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
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
            Bucket: BUCKET_NAME,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
        })
    );
    const body = await response.Body.transformToString();
    return body;
};

const updateStatus = async (email) => {
    const response = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
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
            CopySource: `/${BUCKET_NAME}/${USERS_PREFIX}${email.user}/${NEW_DIR}/${email.messageId}`,
            Bucket: BUCKET_NAME,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
        })
    );
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${USERS_PREFIX}${email.user}/${NEW_DIR}/${email.messageId}`,
        })
    );
};

export const handler = async (event) => {
    if (!event.context.email.endsWith(`@${MY_DOMAIN_NAME}`)) {
        throw new Error(`Unknown domain\'s mail. (email: ${event.context.email})`);
    }
    const user = event.context.email.replace(`@${MY_DOMAIN_NAME}`, '');
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
