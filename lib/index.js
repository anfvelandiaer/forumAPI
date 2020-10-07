'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var koaLogger = _interopDefault(require('koa-logger'));
var koaBody = _interopDefault(require('koa-bodyparser'));
var koaCors = _interopDefault(require('@koa/cors'));
var apolloServerKoa = require('apollo-server-koa');
var merge = _interopDefault(require('lodash.merge'));
var GraphQLJSON = _interopDefault(require('graphql-type-json'));
var graphqlTools = require('graphql-tools');
var request = _interopDefault(require('request-promise-native'));
var graphql = require('graphql');

/**
 * Creates a request following the given parameters
 * @param {string} url
 * @param {string} method
 * @param {object} [body]
 * @param {boolean} [fullResponse]
 * @return {Promise.<*>} - promise with the error or the response object
 */
async function generalRequest(url, method, body, fullResponse) {
	const parameters = {
		method,
		uri: encodeURI(url),
		body,
		json: true,
		resolveWithFullResponse: fullResponse
	};
	if (process.env.SHOW_URLS) {
		// eslint-disable-next-line
		console.log(url);
	}

	try {
		return await request(parameters);
	} catch (err) {
		return err;
	}
}

/**
 * Adds parameters to a given route
 * @param {string} url
 * @param {object} parameters
 * @return {string} - url with the added parameters
 */
function addParams(url, parameters) {
	let queryUrl = `${url}?`;
	for (let param in parameters) {
		// check object properties
		if (
			Object.prototype.hasOwnProperty.call(parameters, param) &&
			parameters[param]
		) {
			if (Array.isArray(parameters[param])) {
				queryUrl += `${param}=${parameters[param].join(`&${param}=`)}&`;
			} else {
				queryUrl += `${param}=${parameters[param]}&`;
			}
		}
	}
	return queryUrl;
}

/**
 * Generates a GET request with a list of query params
 * @param {string} url
 * @param {string} path
 * @param {object} parameters - key values to add to the url path
 * @return {Promise.<*>}
 */
function getRequest(url, path, parameters) {
	const queryUrl = addParams(`${url}/${path}`, parameters);
	return generalRequest(queryUrl, 'GET');
}

/**
 * Merge the schemas in order to avoid conflicts
 * @param {Array<string>} typeDefs
 * @param {Array<string>} queries
 * @param {Array<string>} mutations
 * @return {string}
 */
function mergeSchemas(typeDefs, queries, mutations) {
	return `${typeDefs.join('\n')}
    type Query { ${queries.join('\n')} }
    type Mutation { ${mutations.join('\n')} }`;
}

function formatErr(error) {
	const data = graphql.formatError(error);
	const { originalError } = error;
	if (originalError && originalError.error) {
		const { path } = data;
		const { error: { id: message, code, description } } = originalError;
		return { message, code, description, path };
	}
	return data;
}

const threadTypeDef = `
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

const threadQueries = `
      allThreads: [Thread]!
      threadLevel(id: String!, active: String!): [Thread]!
      threadById(id: String!): Thread!
  `;

const threadMutations = `
    createThread(thread: ThreadInput!): Thread!
    updateThread(id: String!, thread: ThreadInput!): Thread!
    deleteThread(id: String!): String
`;


const entryTypeDef = `
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

const entryQueries = `
      allEntrys: [Entry]!
      entryThread(id: String!, active: String!): [Entry]!
      entryById(id: String!): Entry!
  `;

const entryMutations = `
    createEntry(entry: EntryInput!): Entry!
    updateEntry(id: String!, entry: EntryInput!): Entry!
    deleteEntry(id: String!): String
`;

const urlForum = 'ec2-18-205-59-255.compute-1.amazonaws.com';
const portForum = '4000';
const entryPointForum = 'api/v1';
const threadsForum = 'threads';
const entrysForum = 'entrys';

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

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		threadTypeDef,
		entryTypeDef
	],
	[
		threadQueries,
		entryQueries
	],
	[
		threadMutations,
		entryMutations
	]
);

// Generate the schema object from your types definition.
var graphQLSchema = graphqlTools.makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		resolvers
	)
});

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;

app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	await next();
});

// GraphQL
const graphql$1 = apolloServerKoa.graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql$1);
router.get('/graphql', graphql$1);

// test route
router.get('/graphiql', apolloServerKoa.graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
