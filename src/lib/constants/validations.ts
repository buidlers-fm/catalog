const validations = {
  bookNote: {
    text: {
      maxLength: 1000,
    },
  },
  bookPost: {
    text: {
      maxLength: 10_000,
    },
    title: {
      maxLength: 100,
    },
  },
  comment: {
    list: {
      text: {
        maxLength: 300,
      },
    },
    note: {
      text: {
        maxLength: 300,
      },
    },
    post: {
      text: {
        maxLength: 10_000,
      },
    },
  },
  list: {
    bookNote: {
      maxLength: 300,
    },
  },
  userCurrentStatus: {
    text: {
      maxLength: 300,
    },
  },
}

export default validations
