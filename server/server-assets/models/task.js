let mongoose = require('mongoose')
let Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId
let schemaName = 'Task'

let comment = new Schema({
  description: { type: String, required: true },
  taskId: { type: ObjectId, ref: 'Task', required: true }
},
  { timestamps: true })


let schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  listId: { type: ObjectId, ref: 'List', required: true },
  authorId: { type: ObjectId, ref: 'User', required: true },
  boardId: { type: ObjectId, ref: 'Board', required: true },
  comments: [comment]
},
  { timestamps: true })


module.exports = mongoose.model(schemaName, schema)