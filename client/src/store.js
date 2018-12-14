import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
import router from './router'

Vue.use(Vuex)

let production = !window.location.host.includes('localhost')
let baseUrl = production ? 'https://aubreychrissykanban.herokuapp.com/' : '//localhost:3000/'

let auth = Axios.create({
  baseURL: baseUrl + "auth/",
  timeout: 3000,
  withCredentials: true
})

let api = Axios.create({
  baseURL: baseUrl + "api/",
  timeout: 3000,
  withCredentials: true
})

export default new Vuex.Store({
  state: {
    user: {},
    boards: [],
    activeBoard: {},
    lists: [],
    tasks: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setBoards(state, boards) {
      state.boards = boards
    },
    setBoard(state, board) {
      state.activeBoard = board
    },
    setLists(state, lists) {
      state.lists = lists
    },
    addList(state, list) {
      state.lists.push(list)
    },
    setTasks(state, payload) {
      Vue.set(state.tasks, payload.listId, payload.tasks)
    },
    addTask(state, task) {
      state.tasks.push(task)
    },
    modifyTask(state, task) {
      let taskIndex = state.tasks[task.listId].findIndex(t => {
        return t._id == task._id
      })
      state.tasks[task.listId].splice(taskIndex, 1, task)
    },
    updateTask(state, task) {
      let newListId = state.tasks[task.listId].findIndex(i => {
        return i._id == task.listId
      })
      state.tasks[task.listId].splice(newListId, 1, task)
    }
  },
  actions: {
    //AUTH STUFF
    register({ commit, dispatch }, newUser) {
      auth.post('register', newUser)
        .then(res => {
          commit('setUser', res.data)
          router.push({ name: 'boards' })
        })
    },
    authenticate({ commit, dispatch }) {
      auth.get('authenticate')
        .then(res => {
          commit('setUser', res.data)
          dispatch('getBoards')
          // router.push({ name: 'boards' })
        }).catch(err=>{
          console.err('NOT LOGGED IN')
          router.push({name: 'login'})
        })
    },
    login({ commit, dispatch }, creds) {
      auth.post('login', creds)
        .then(res => {
          commit('setUser', res.data)
          router.push({ name: 'boards' })
        })
    },
    logout({ commit }) {
      auth.delete('logout')
        .then(res => {
          commit('setUser', {})
          router.push({ name: 'login' })
        })
    },

    //BOARDS
    getBoards({ commit, dispatch }) {
      debugger
      api.get('boards')
        .then(res => {
          debugger
          console.log('boards', res.data)
          commit('setBoards', res.data)
        })
    },
    getBoard({ commit, dispatch }, boardId) {
      api.get('boards/' + boardId)
        .then(res => {
          commit('setBoard', res.data)
        })
    },
    addBoard({ commit, dispatch }, boardData) {
      api.post('boards', boardData)
        .then(serverBoard => {
          dispatch('getBoards')
        })
    },
    deleteBoard({ commit, dispatch }, boardId) {
      api.delete('boards/' + boardId)
        .then(res => {
          dispatch('getBoards')
        })
    },
    //LISTS
    getLists({ commit }, boardId) {
      api.get('boards/' + boardId + '/lists/')
        .then(res => {
          console.log('lists', res)
          commit('setLists', res.data)
        })
    },
    addList({ commit, dispatch }, listData) {
      api.post('lists/', listData)
        .then(res => {
          console.log('new lists', res.data)
          // dispatch('getLists', listData.boardId)
          commit('addList', res.data)
        })
    },
    deleteList({ commit, dispatch }, payload) {
      api.delete('lists/' + payload.listId)
        .then(res => {
          console.log('list deleted')
          dispatch('getLists', payload.boardId)
        })
    },
    //TASKS
    getTasks({ commit }, listId) {
      api.get('lists/' + listId + '/tasks/')
        .then(res => {
          console.log('tasks', res.data)
          let payload = {
            listId: listId,
            tasks: res.data
          }
          commit('setTasks', payload)
        })
    },
    addTask({ commit, dispatch }, taskData) {
      api.post('tasks/', taskData)
        .then(res => {
          console.log('new task created', res.data)
          let payload = {
            boardId: taskData.boardId,
            listId: taskData.listId
          }
          dispatch('getTasks', payload.listId)
          // commit('addTask', payload)
        })
        .catch(err => {
          console.error(err)
        })
    },
    deleteTask({ commit, dispatch }, taskData) {
      api.delete('tasks/' + taskData.taskId)
        .then(res => {
          console.log('task deleted!')
          dispatch('getTasks', taskData.listId)
        })
    },
    updateTask({ commit, dispatch }, taskData) {
      api.put('tasks/' + taskData.taskId, taskData)
        .then(res => {
          dispatch('getTasks', taskData.listId)
          dispatch('getTasks', taskData.oldList)
        })
    },

    // COMMENTS
    addComment({ commit, dispatch }, payload) {
      api.put('tasks/' + payload.taskId + '/create-comment', payload)
        .then(res => {
          console.log(res)
          commit('modifyTask', res.data)
          // will have to commit and inside of that mutation will have to replace the task in your state with the task you got back in the res
        })
        .catch(err => {
          console.error(err)
        })
    },
    deleteComment({ commit, dispatch }, payload) {
      api.put('tasks/' + payload.taskId + '/delete-comment/' + payload.commentId, payload)
        .then(res => {
          console.log(res)
          commit('modifyTask', res.data)
          // will have to commit and inside of that mutation will have to replace the task in your state with the task you got back in the res
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
})