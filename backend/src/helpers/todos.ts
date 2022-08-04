import { TodosAccess } from './todosAcess'
// import { getUploadUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { create } from 'domain'

// TODO: Implement businessLogic
const todosAcess = new TodosAccess()
const logger = createLogger('todos')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`getTodosForUser: ${userId}` , {
        key: userId
    })
    const result = todosAcess.getTodosForUser(userId)
    logger.info(`getTodosForUser: successfully`, {
        key: userId
    })
    return result
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info(`createTodo: ${createTodoRequest}`, {
        key: userId
    })
    const todoId = uuid.v4()

    const newTodo: TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    }

    const result = await todosAcess.createTodo(newTodo)
    logger.info(`createTodo: successfully`, {
        key: userId,
        newTodo: newTodo
    })
    return result
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string) {
    logger.info(`updateTodoRequest: ${updateTodoRequest}`, {
        key: userId
    })
    const updateTodo: TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        attachmentUrl: null
    }

    await todosAcess.updateTodo(updateTodo, userId, todoId);
    logger.info(`updateTodo: successfully`, {
        key: userId,
        updateTodo: updateTodo
    })
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info(`deleteTodo: ${todoId}`, {
        key: userId
    })
    await todosAcess.deleteTodo(userId, todoId)
    logger.info(`deleteTodo: successfully`, {
        key: userId
    })
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string, attachmentUrl: string) {
    logger.info(`createAttachmentPresignedUrl: ${attachmentUrl}`, {
        key: userId
    })

    const result = await todosAcess.createAttachmentPresignedUrl(todoId, userId, attachmentUrl);

    logger.info(`createAttachmentPresignedUrl: successfully`, {
        key: userId
    })
    return result
  }


