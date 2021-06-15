import { TaskState } from './TaskState'

export function getStateColor (state) {
  switch (state) {
    case TaskState.Todo.value:
      return {
        color: '#212529',
        backgroundColor: '#fff',
        border: '1px solid #000000'
      }
    case TaskState.InProgress.value:
      return {
        color: '#212529',
        backgroundColor: '#ffc107'
      }
    case TaskState.Done.value:
      return {
        color: '#fff',
        backgroundColor: '#28a745'
      }
    default:
      return {
        color: '#fff',
        backgroundColor: '#17a2b8'
      }
  }
}
