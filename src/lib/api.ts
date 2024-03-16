import humps from "humps"
import { fetchJson } from "lib/helpers/general"
import Sort from "enums/Sort"
import CommentParentType from "enums/CommentParentType"

const prepReqBody = (data) => JSON.stringify(humps.decamelizeKeys(data))

const api = {
  adaptations: {
    get: (bookId) => {
      const params = {
        bookId,
      }
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/adaptations?${queryString}`
      return fetchJson(url)
    },
    create: (requestData) =>
      fetchJson(`/api/adaptations`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    update: (adaptationId, requestData) =>
      fetchJson(`/api/adaptations/${adaptationId}`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    delete: (adaptationId) =>
      fetchJson(`/api/adaptations/${adaptationId}`, {
        method: "DELETE",
      }),
  },
  auth: {
    signUp: (requestData) =>
      fetchJson(`/api/auth/sign-up`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  books: {
    get: (openLibraryWorkId: string) => {
      const params = {
        openLibraryWorkId,
      }

      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/books?${queryString}`
      return fetchJson(url)
    },
    getActivity: (bookId) => fetchJson(`/api/books/${bookId}/activity`),
    update: (bookId, requestData) =>
      fetchJson(`/api/books/${bookId}`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    updateCover: (bookId, requestData) =>
      fetchJson(`/api/books/${bookId}/covers`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    search: (searchStr) => {
      const params = {
        query: searchStr,
      }
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/books/search?${queryString}`
      return fetchJson(url)
    },
  },
  bookNotes: {
    get: (params: {
      bookId?: string
      userProfileId?: string
      noteTypes?: string[]
      limit?: number
      requireText?: boolean
      sort?: Sort
    }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/book_notes?${queryString}`
      return fetchJson(url)
    },
    create: (requestData) =>
      fetchJson(`/api/book_notes`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    update: (bookNoteId, requestData) =>
      fetchJson(`/api/book_notes/${bookNoteId}`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    delete: (bookNoteId) =>
      fetchJson(`/api/book_notes/${bookNoteId}`, {
        method: "DELETE",
      }),
  },
  bookPosts: {
    create: (requestData) =>
      fetchJson(`/api/book_posts`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  bookReads: {
    get: (params: { bookId?: string; forCurrentUser?: boolean }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/book_reads?${queryString}`
      return fetchJson(url)
    },
  },
  comments: {
    find: (commentId) => fetchJson(`/api/comments/${commentId}`),
    get: (params: {
      parentType?: CommentParentType
      parentId?: string
      commenterId?: string
      commenterType?: string
      limit?: number
    }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/comments?${queryString}`
      return fetchJson(url)
    },
    create: (requestData) =>
      fetchJson(`/api/comments`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    update: (commentId, requestData) =>
      fetchJson(`/api/comments/${commentId}`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    delete: (commentId) =>
      fetchJson(`/api/comments/${commentId}`, {
        method: "DELETE",
      }),
  },
  feedbackSubmissions: {
    create: (requestData) =>
      fetchJson(`/api/feedback_submissions`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  follows: {
    create: (userProfileId) =>
      fetchJson(`/api/follows`, {
        method: "POST",
        body: prepReqBody({ userProfileId }),
      }),
    delete: (userProfileId) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys({ userProfileId })).toString()
      const url = `/api/follows?${queryString}`

      return fetchJson(url, {
        method: "DELETE",
      })
    },
  },
  invites: {
    get: () => fetchJson(`/api/user_invites`),
    create: (requestData) =>
      fetchJson(`/api/user_invites`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  leaderboard: {
    get: (params: { limit?: number }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/leaderboard?${queryString}`
      return fetchJson(url)
    },
  },
  likes: {
    get: (params: {
      likedObjectId?: string
      likedObjectType?: string
      userProfileId?: string
      compact?: boolean
    }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/likes?${queryString}`
      return fetchJson(url)
    },
    create: (requestData) =>
      fetchJson(`/api/likes`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    delete: (likeId) =>
      fetchJson(`/api/likes/${likeId}`, {
        method: "DELETE",
      }),
    deleteByParams: (params) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/likes?${queryString}`

      return fetchJson(url, {
        method: "DELETE",
      })
    },
  },
  lists: {
    get: (params: {
      userProfileId?: string
      bookId?: string
      limit?: number
      featured?: boolean
    }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/lists?${queryString}`
      return fetchJson(url)
    },
    create: (requestData) =>
      fetchJson(`/api/lists`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    update: (listId, requestData) =>
      fetchJson(`/api/lists/${listId}`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    delete: (listId) =>
      fetchJson(`/api/lists/${listId}`, {
        method: "DELETE",
      }),
    addBook: (requestData) =>
      fetchJson(`/api/lists/add_book`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  notifs: {
    getUnread: () => {
      const params = {
        read: false,
      }
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/notifs?${queryString}`
      return fetchJson(url)
    },
    markAllAsRead: () =>
      fetchJson(`/api/notifs/mark_all_as_read`, {
        method: "PATCH",
      }),
  },
  openGraph: {
    get: (url) => {
      const params = {
        url,
      }
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const apiUrl = `/api/open_graph?${queryString}`
      return fetchJson(apiUrl)
    },
  },
  pins: {
    create: (requestData) =>
      fetchJson(`/api/pins`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    reorder: (requestData) =>
      fetchJson(`/api/pins`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
    delete: (requestData) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(requestData)).toString()
      const url = `/api/pins?${queryString}`

      return fetchJson(url, {
        method: "DELETE",
      })
    },
  },
  profiles: {
    find: (userId) => fetchJson(`/api/profiles/${userId}`),
    update: (userId, formData) =>
      fetchJson(`/api/profiles/${userId}`, {
        method: "PATCH",
        body: formData,
      }),
    search: (searchStr) => {
      const params = {
        query: searchStr,
      }
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/profiles/search?${queryString}`
      return fetchJson(url)
    },
  },
  saves: {
    get: () => fetchJson(`/api/saves`),
    create: (requestData) =>
      fetchJson(`/api/saves`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    delete: (saveId) =>
      fetchJson(`/api/saves/${saveId}`, {
        method: "DELETE",
      }),
  },
  userBookShelves: {
    get: (params: { bookId?: string } = {}) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/user_book_shelves?${queryString}`
      return fetchJson(url)
    },
    set: (requestData) =>
      fetchJson(`/api/user_book_shelves`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    remove: (bookId) => {
      const requestData = { bookId }
      const queryString = new URLSearchParams(humps.decamelizeKeys(requestData)).toString()
      return fetchJson(`/api/user_book_shelves?${queryString}`, {
        method: "DELETE",
      })
    },
  },
  userConfigs: {
    update: (requestData) =>
      fetchJson(`/api/user_configs`, {
        method: "PATCH",
        body: prepReqBody(requestData),
      }),
  },
  userCurrentStatuses: {
    create: (requestData) =>
      fetchJson(`/api/user_current_statuses`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
    delete: () =>
      fetchJson(`/api/user_current_statuses`, {
        method: "DELETE",
      }),
  },
  waitlisters: {
    markAsInvited: (waitlisterId) =>
      fetchJson(`/api/waitlisters/${waitlisterId}/mark_as_invited`, {
        method: "PATCH",
      }),
  },
}

export default api
