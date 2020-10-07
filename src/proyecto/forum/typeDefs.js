export const threadTypeDef = `
    type Thread{
        _id: String!
        title: String!
        description: String!
        levelId: String!
        userName: String!
        userId: String!
        active: Boolean!
    }
  input ThreadInput {
        _id: String
        title: String!
        description: String
        levelId: String
        userName: String
        userId: String
        active: Boolean
  }`;

export const threadQueries = `
      allThreads: [Thread]!
      threadLevel(id: String!, active: String!): [Thread]!
      threadById(id: String!): Thread!
  `;

export const threadMutations = `
    createThread(thread: ThreadInput!): Thread!
    updateThread(id: String!, thread: ThreadInput!): Thread!
    deleteThread(id: String!): String
`;


export const entryTypeDef = `
    type Entry{
        _id: String!
        message: String!
        threadId: String!
        userName: String!
        userId: String!
        active: Boolean!
        isAuthor: Boolean!
    }
  input EntryInput {
        _id: String
        message: String!
        threadId: String!
        userName: String!
        userId: String!
        active: Boolean
        isAuthor: Boolean
  }`;

export const entryQueries = `
      allEntrys: [Entry]!
      entryThread(id: String!, active: String!): [Entry]!
      entryById(id: String!): Entry!
  `;

export const entryMutations = `
    createEntry(entry: EntryInput!): Entry!
    updateEntry(id: String!, entry: EntryInput!): Entry!
    deleteEntry(id: String!): String
`;

