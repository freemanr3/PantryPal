import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      budget: a.float(),
      dietaryPreferences: a.array(a.string()),
      ingredients: a.array(a.string()),
      profilePicture: a.string(),
      recipes: a.hasMany('Recipe'),
      favorites: a.hasMany('Recipe'),
    })
    .authorization([a.allow.owner(), a.allow.public('read')]),

  Recipe: a
    .model({
      title: a.string().required(),
      description: a.string(),
      ingredients: a.array(a.string()).required(),
      instructions: a.array(a.string()).required(),
      cookingTime: a.integer(),
      servings: a.integer(),
      cost: a.float(),
      imageUrl: a.string(),
      createdBy: a.belongsTo('User'),
      favoritedBy: a.hasMany('User'),
      tags: a.array(a.string()),
    })
    .authorization([
      a.allow.owner('create', 'update', 'delete'),
      a.allow.public('read'),
    ]),

  Ingredient: a
    .model({
      name: a.string().required(),
      category: a.string(),
      price: a.float(),
      unit: a.string(),
      imageUrl: a.string(),
    })
    .authorization([a.allow.public()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresIn: 7,
    },
    iamAuthorizationMode: {
      enabled: true,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
