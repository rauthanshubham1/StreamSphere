import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"

const client = new SQSClient({
    region: PROCESS.env.AWS_REGION,
    credentials: {
        "accessKeyId": process.env.SQS_ACCESS_KEY_ID,
        "secretAccessKey": process.env.SQS_SECRET_ACCESS_KEY
    }
});

const ecsClient = new ECSClient({
    region: PROCESS.env.AWS_REGION,
    credentials: {
        "accessKeyId": process.env.SQS_ACCESS_KEY_ID,
        "secretAccessKey": precess.env.SQS_SECRET_ACCESS_KEY
    }
});

const QUEUE_URL = process.env.QUEUE_URL;

async function init() {
    const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 4,  // 60 seconds
    });


    while (true) {
        const { Messages } = await client.send(command);

        if (!Messages) {
            console.log("No message in Queue");
            continue;
        }
        try {
            for (const message of Messages) {
                const { MessageId, Body } = message;
                console.log("Message received ", { MessageId, Body });

                if (!Body) { continue; }

                // Validate and parse the event
                const event = JSON.parse(Body);

                if ("Service" in event && "Event" in event) {
                    if (event.Event === "s3.TestEvent") {
                        await client.send(
                            new DeleteMessageCommand(
                                {
                                    QueueUrl: QUEUE_URL,
                                    ReceiptHandle: message.ReceiptHandle,
                                }
                            )
                        );
                        continue;
                    }
                }

                for (const record of event.Records) {
                    const { s3 } = record;
                    const {
                        bucket,
                        object: { key }
                    } = s3;

                    // Spin the docker container
                    const runTaskCmd = new RunTaskCommand({
                        taskDefinition: process.env.TASK_DEFINITION,
                        cluster: process.env.CLUSTER,
                        launchType: "FARGATE",
                        networkConfiguration: {
                            awsvpcConfiguration: {
                                assignPublicIp: "ENABLED",
                                securityGroups: ['sg-0acccf147560c9b3b'],
                                subnets: ["subnet-0790f95496d9677f6", "subnet-0afce6a3b1b968bdb", "subnet-0d19755b83117cdd7"]
                            }
                        },
                        overrides: {
                            containerOverrides: [
                                {
                                    name: "video-transcoder",
                                    environment: [
                                        { name: "BUCKET_NAME", value: bucket.name },
                                        { name: 'KEY', value: key }
                                    ]
                                }
                            ]
                        }
                    });
                    await ecsClient.send(runTaskCmd);

                    // Delete the message from queue
                    await client.send(
                        new DeleteMessageCommand({
                            QueueUrl: QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle,
                        })
                    );
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}

init();
