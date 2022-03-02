Clowder2 React Frontend
============================================

**Work in Progress**

Fronted for [Clowder2 backend API](https://github.com/clowder-framework/clowder2-backend).
Written using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/),
[Material UI](https://mui.com/), [Redux](https://redux.js.org/), [webpack](https://webpack.js.org/),
[Node.js](https://nodejs.org).

Install dependencies:

`npm install`

Run for development:

`npm run start:dev`

By default backend runs at `http://localhost:8000`. If running at different url/port, use:

`CLOWDER_REMOTE_HOSTNAME=http://somewhere:9999 npm start`

Update calls to backend (if needed, backend must be running):

`CLOWDER_REMOTE_HOSTNAME=http://localhost:8000 npm run codegen:v2`

Build for production:

`npm run build`

Deployed using Docker:

`docker compose -t clowder/clowder2-frontend`

`CLOWDER_REMOTE_HOSTNAME=http://localhost:8000 docker compose up`

