// function name: handleReceiveSESMail

import {
    CopyObjectCommand,
    DeleteObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const s3Client = new S3Client({region: 'us-west-2'});
const dynamodbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

const MY_DOMAIN_NAME = 'saintsouth.net';
const USERNAME_DELIMITER = '+';
const TRUSH_PREFIX = 'trash/';
const USERS_PREFIX = 'users/';

const TABLE_NAME = 'mailbox';

export const handler = async (event, context) => {
    for (const record of event.Records) {
        await processMessageAsync(record);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('done'),
    };
    return response;
};

const processMessageAsync = async (record) => {
    // see: https://docs.aws.amazon.com/ja_jp/ses/latest/dg/receiving-email-notifications-contents.html

    const message = JSON.parse(record.Sns.Message);

    // check notificationType (this may always be "Received")
    if (message.notificationType !== "Received") {
        console.info(`notificationType ${message.notificationType} is not "Received".`);
        await moveToTrash(message);
        return await Promise.resolve(record);
    }

    // destinations check.
    const destinations = filterDestinations(message.mail.destination);
    if (destinations.length <= 0) {
        console.info(`destinations are not include own domain ${MY_DOMAIN_NAME}".`);
        await moveToTrash(message);
        return await Promise.resolve(record);
    }

    // check spam.
    const spam = filterSpam(message);
    if (spam !== null) {
        const key = message.receipt.action.objectKey.replace(
            message.receipt.action.objectKeyPrefix, ''
        );
        console.info(`message ${key} has some spam.`);
        await moveToTrash(message);
        return await Promise.resolve(record);
    }

    // delivery message to destinations.
    await moveToUsers(message, destinations);
    return await Promise.resolve(record);
};

const filterDestinations = (destinations) => {
    return destinations.filter((v) => {
        return v.endsWith(`@${MY_DOMAIN_NAME}`);
    });
};

/**
 * Filter the spam message.
 * @param {*} message 
 * @returns null: OK, message: Spam message.
 */
const filterSpam = (message) => {
    if (message.receipt.spamVerdict.status !== 'PASS') {
        console.info(`spamVerdict is not PASS, from ${message.mail.commonHeaders.returnPath}`);
        return message;
    }
    if (message.receipt.virusVerdict.status !== 'PASS') {
        console.info(`virusVerdict is not PASS, from ${message.mail.commonHeaders.returnPath}`);
        return message;
    }
    if (message.receipt.spfVerdict.status !== 'PASS') {
        // return message;
        console.info(`spfVerdict is not PASS, from ${message.mail.commonHeaders.returnPath}`);
        return null;
    }
    if (message.receipt.dkimVerdict.status !== 'PASS') {
        // return message;
        console.info(`dkimVerdict is not PASS, from ${message.mail.commonHeaders.returnPath}`);
        return null;
    }
    if (message.receipt.dmarcVerdict.status !== 'PASS') {
        // return message;
        console.info(`dmarcVerdict is not PASS, from ${message.mail.commonHeaders.returnPath}`);
        return null;
    }
    return null;
};

const moveToTrash = async (message) => {
    await s3Client.send(
        new CopyObjectCommand({
            CopySource: `/${message.receipt.action.bucketName}/${message.receipt.action.objectKey}`,
            Bucket: message.receipt.action.bucketName,
            Key: `${TRUSH_PREFIX}${message.mail.messageId}`,
        })
    );
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: message.receipt.action.bucketName,
            Key: message.receipt.action.objectKey,
        })
    );
};

const moveToUsers = async (message, destinations) => {
    for (const destination of destinations) {
        let user = destination.replace(`@${MY_DOMAIN_NAME}`, ''); // remove domain part.
        user = user.split(USERNAME_DELIMITER)[0]; // remove alias.
        const defaultDir = 'new';
        await s3Client.send(
            new CopyObjectCommand({
                CopySource: `/${message.receipt.action.bucketName}/${message.receipt.action.objectKey}`,
                Bucket: message.receipt.action.bucketName,
                Key: `${USERS_PREFIX}${user}/${defaultDir}/${message.mail.messageId}`,
            })
        );
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    'user': user,
                    'receivedAt': message.mail.timestamp,
                    'status': defaultDir,
                    'messageId': message.mail.messageId,
                    'from': message.mail.commonHeaders.returnPath || '',
                    'subject': message.mail.commonHeaders.subject || '',
                },
            })
        );
        console.info(`delivered to ${destination}.`);
    }
    console.log(JSON.stringify({
        message: 'delete object from "borrowing"',
        Bucket: message.receipt.action.bucketName,
        Key: message.receipt.action.objectKey,
    }));
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: message.receipt.action.bucketName,
            Key: message.receipt.action.objectKey,
        })
    );
};
