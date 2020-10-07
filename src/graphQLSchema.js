import merge from 'lodash.merge';
import GraphQLJSON from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { mergeSchemas } from './utilities';

import {
	threadMutations,
	threadQueries,
	threadTypeDef,
	entryTypeDef,
	entryQueries,
	entryMutations,
	ticketTypeDef,
	ticketQueries,
	ticketMutations,
} from './proyecto/forum/typeDefs';

import categoryResolvers from './proyecto/forum/resolvers';

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		threadTypeDef,
		entryTypeDef,
		ticketTypeDef
	],
	[
		threadQueries,
		entryQueries,
		ticketQueries
	],
	[
		threadMutations,
		entryMutations,
		ticketMutations
	]
);

// Generate the schema object from your types definition.
export default makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		categoryResolvers
	)
});
