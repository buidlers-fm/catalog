import humps from "humps"
import { fetchJson } from "lib/helpers/general"

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
    get: ({ bookId, noteType, userProfileId, limit, requireText }: any) => {
      const params = {
        bookId,
        noteType,
        userProfileId,
        limit,
        requireText,
      }

      Object.keys(params).forEach((key) => params[key] === undefined && delete params[key])

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
}

export default api
