// function name: SaintSouthMailService-DeleteEmail

import {
    DeleteObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({region: 'us-west-2'});
const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const MY_DOMAIN_NAME = 'saintsouth.net';

const BUCKET_NAME = "mailbox.saintsouth.net";
const USERS_PREFIX = 'users/';
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

const deleteEmail = async (email) => {
    await docClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                user: email.user,
                receivedAt: email.receivedAt,
            },
        })
    );
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${USERS_PREFIX}${email.user}/${email.status}/${email.messageId}`,
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
    deleteEmail(email);
    return {};
};
