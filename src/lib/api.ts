import humps from "humps"
import { fetchJson } from "lib/helpers/general"
import Sort from "enums/Sort"

const prepReqBody = (data) => JSON.stringify(humps.decamelizeKeys(data))

const api = {
  auth: {
    signUp: (requestData) =>
      fetchJson(`/api/auth/sign-up`, {
        method: "POST",
        body: prepReqBody(requestData),
      }),
  },
  books: {
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
  likes: {
    get: (params: {
      likedObjectId: string
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
  },
  lists: {
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
  },
  userBookShelves: {
    get: (params: { bookId?: string }) => {
      const queryString = new URLSearchParams(humps.decamelizeKeys(params)).toString()
      const url = `/api/user_book_shelves?${queryString}`
      return fetchJson(url)
    },
    set: (requestData) =>
      fetchJson(`/api/user_book_shelves`, {
        method: "POST",
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
}

export default api
