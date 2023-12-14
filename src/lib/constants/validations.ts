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
}

export default validations
