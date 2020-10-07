import { generalRequest, getRequest } from '../../utilities';
import { urlForum, portForum, entryPointForum, threadsForum, entrysForum } from './server';

const URLForumThreads = `http://${urlForum}:${portForum}/${entryPointForum}/${threadsForum}`;
const URLForumEntrys = `http://${urlForum}:${portForum}/${entryPointForum}/${entrysForum}`;



const resolvers = {
	Query: {
		allThreads: (_) =>
			getRequest(URLForumThreads, ''),
		threadById: (_, { id }) =>
			generalRequest(`${URLForumThreads}/${id}`, 'GET'),
		threadLevel: (_, { id, active }) =>
			generalRequest(`${URLForumThreads}/level/${id}/${active}`, 'GET'),
		

		allEntrys: (_) =>
			getRequest(URLForumEntrys, ''),
		entryById: (_, { id }) =>
			generalRequest(`${URLForumEntrys}/${id}`, 'GET'),
		entryThread: (_, { id, active }) =>
			generalRequest(`${URLForumEntrys}/thread/${id}/${active}`, 'GET'),
	},
	Mutation: {
		createThread: (_, { thread }) =>
			generalRequest(`${URLForumThreads}/`, 'POST', thread),
		updateThread: (_, { id, thread }) =>
			generalRequest(`${URLForumThreads}/${id}/`, 'PUT', thread),
		deleteThread: (_, { id }) =>
			generalRequest(`${URLForumThreads}/${id}/`, 'DELETE'),

		createEntry: (_, { entry }) =>
			generalRequest(`${URLForumEntrys}/`, 'POST', entry),
		updateEntry: (_, { id, entry }) =>
			generalRequest(`${URLForumEntrys}/${id}/`, 'PUT', entry),
		deleteEntry: (_, { id }) =>
			generalRequest(`${URLForumEntrys}/${id}/`, 'DELETE')
	}
};

export default resolvers;
