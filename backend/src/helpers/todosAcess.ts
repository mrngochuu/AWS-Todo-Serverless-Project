import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { ProcessBehavior } from 'aws-sdk/clients/lexmodelbuildingservice';

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info(`Get all todos for user: ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Createing a todo with id ${todo.todoId}`)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        })
        return todo
    }

    async updateTodo(todo: TodoUpdate, userId: string, todoId: string) {
        logger.info(`Updating a todo with id: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done
            }
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info(`Deleting a todo with id: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }

    async createAttactmentPresignedUrl(userId: string, todoId: string, attachmentUrl: string) {
        logger.info(`Creating attachment presigned url with id: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }
        })
        return attachmentUrl
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

