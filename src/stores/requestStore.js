// import { defineStore } from 'pinia'
// import axios from 'axios'

// export const useRequestStore = defineStore('requests', {
//   state: () => ({
//     requests: [],
//     loading: false,
//     error: ''
//   }),

//   actions: {
//     async getRequests() {
//       this.loading = true
//       this.error = ''

//       try {
//         const response = await axios.get(
//           'https://dummyjson.com/products'
//         )

//         this.requests = response.data.products.map(product => ({
//           id: product.id,
//           title: product.title,
//           department: 'IT',
//           priority: 'Medium',
//           status: 'New',
//           assignee: 'Unassigned',
//           description: product.description
//         }))
//       } catch (err) {
//         this.error = 'Failed to load requests'
//       } finally {
//         this.loading = false
//       }
//     },

//     async deleteRequest(id) {
//       try {
//         await axios.delete(
//           `https://dummyjson.com/products/${id}`
//         )

//         this.requests = this.requests.filter(
//           request => request.id !== id
//         )
//       } catch (err) {
//         this.error = 'Failed to delete request'
//       }
//     }
//   }
// })

import { defineStore } from 'pinia'
import axios from 'axios'

export const useRequestStore = defineStore('requests', {
  state: () => ({
    requests: [],
    loading: false,
    error: '',
    success: ''
  }),

  actions: {

    async getRequests() {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(
          'https://dummyjson.com/products'
        )

        this.requests = response.data.products.map(product => ({
          id: product.id,
          title: product.title,
          department: 'IT',
          priority: 'Medium',
          status: 'New',
          assignee: 'Unassigned',
          description: product.description
        }))

      } catch (err) {
        this.error = 'Failed to load requests'

      } finally {
        this.loading = false
      }
    },

    async addRequest(request) {
      this.loading = true
      this.error = ''
      this.success = ''

      try {
        const response = await axios.post(
          'https://dummyjson.com/products/add',
          {
            title: request.title,
            description: request.description,
            price: 100
          }
        )

        const newRequest = {
          id: response.data.id,
          title: request.title,
          department: request.department,
          priority: request.priority,
          status: request.status,
          assignee: request.assignee,
          description: request.description
        }

        this.requests.unshift(newRequest)

        this.success = 'Request added successfully'

        return true

      } catch (err) {
        this.error = 'Failed to add request'

        return false

      } finally {
        this.loading = false
      }
    },

    async updateRequest(request) {
      this.error = ''
      this.success = ''

      try {
        await axios.put(
          `https://dummyjson.com/products/${request.id}`,
          {
            title: request.title,
            description: request.description
          }
        )

        const index = this.requests.findIndex(
          item => item.id === request.id
        )

        if (index !== -1) {
          this.requests[index] = {
            ...request
          }
        }

        this.success = 'Request updated successfully'

        return true

      } catch (err) {
        this.error = 'Failed to update request'

        return false
      }
    },

    async updateStatus(id, newStatus) {
      const request = this.requests.find(
        item => item.id === id
      )

      if (!request) return false

      const oldStatus = request.status

      try {
        request.status = newStatus

        await axios.put(
          `https://dummyjson.com/products/${id}`,
          {
            status: newStatus
          }
        )

        this.success = 'Status updated successfully'

        return true

      } catch (err) {
        request.status = oldStatus
        this.error = 'Failed to update status'

        return false
      }
    },

    async updatePriority(id, newPriority) {
      const request = this.requests.find(
        item => item.id === id
      )

      if (!request) return false

      const oldPriority = request.priority

      try {
        request.priority = newPriority

        await axios.put(
          `https://dummyjson.com/products/${id}`,
          {
            priority: newPriority
          }
        )

        this.success = 'Priority updated successfully'

        return true

      } catch (err) {
        request.priority = oldPriority
        this.error = 'Failed to update priority'

        return false
      }
    },

    async updateAssignee(id, newAssignee) {
      const request = this.requests.find(
        item => item.id === id
      )

      if (!request) return false

      const oldAssignee = request.assignee

      try {
        request.assignee = newAssignee

        await axios.put(
          `https://dummyjson.com/products/${id}`,
          {
            assignee: newAssignee
          }
        );
        this.success = 'Assignee updated successfully'

        return true

      } catch (err) {
        request.assignee = oldAssignee
        this.error = 'Failed to update assignee'

        return false
      }
    },

    async deleteRequest(id) {
      this.error = ''
      this.success = ''

      try {
        await axios.delete(
          `https://dummyjson.com/products/${id}`
        )

        this.requests = this.requests.filter(
          request => request.id !== id
        )

        this.success = 'Request deleted successfully'

        return true

      } catch (err) {
        this.error = 'Failed to delete request'

        return false
      }
    },

    clearMessages() {
      this.error = ''
      this.success = ''
    }
  }
})