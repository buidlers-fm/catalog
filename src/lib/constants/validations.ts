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
  userCurrentStatus: {
    text: {
      maxLength: 300,
    },
  },
}

export default validations
