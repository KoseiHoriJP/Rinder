# Rinder

Rinder is a research participation web application developed by **Group J**. It brings research surveys and experiments into one place so participants can discover studies and researchers can manage recruitment and responses.

## Final report

[Read the project final report](https://docs.google.com/document/d/144vnxjlbzEQYcKlvzVF2tEYMMuNhofERZwfhizIyDsE/edit?tab=t.0).

Access to the report depends on its Google Docs sharing settings. The feature and setup descriptions below are based on the supplied source code.

## Features

- Register an account, sign in, and sign out using session-based authentication.
- Browse research experiments and view study details and eligibility criteria.
- Register for experiments and view participant lists.
- Browse surveys, submit responses, and view survey results.
- Create experiment and survey listings.
- View surveys and experiments on a shared calendar.
- View participation history from the profile page.

These features are represented in the source code; this README does not establish that every workflow has passed end-to-end testing.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React 18, React Router 6, Vite 5, CSS |
| Backend | Python, Flask, Flask-CORS, Flask-MySQLdb, Werkzeug |
| Database | MySQL; supplied dumps use MySQL 8 collation syntax |

## Project structure

```text
src/                       Main React application, pages, and components
backend/flask_app.py       API used by the main frontend
backend/rinder_*.sql       Table dumps for the main API
backend/flask_backend/     Separate backend implementation and SQL dump
backend/old/               Older table dumps
frontend/public/           Alternate frontend files
index.html                 Vite entry page
vite.config.js             Vite configuration
package.json               Frontend scripts and dependencies
package-lock.json          Locked frontend dependency tree
dist/                      Previously generated frontend build
```

Use the root-level frontend and `backend/flask_app.py` together. The alternate implementations are not required for this workflow.

## Local development

The application source was supplied separately as `GroupJ-main (2).zip`. This repository currently contains the README only. Extract that archive and run the following commands from its `GroupJ-main` directory.

### Prerequisites

- Node.js 18 or newer, as required by Vite 5, and npm; use a currently supported Node.js LTS release.
- Python 3 with `venv` and pip.
- A running MySQL 8-compatible server and a local database account.
- Platform-specific MySQL client development libraries, compiler tools, and `pkg-config` if needed to install `mysqlclient`, a dependency of Flask-MySQLdb.

Run the commands below from the project root. These are source-derived setup instructions; a complete application startup has not been validated in this environment.

### 1. Install frontend dependencies

```sh
npm ci
```

### 2. Prepare the database

Create a dedicated local development database named `rinder`. Import the following files into that database in this order using your MySQL client:

1. `backend/rinder_users.sql`
2. `backend/rinder_students.sql`
3. `backend/rinder_professors.sql`
4. `backend/rinder_research_projects.sql`
5. `backend/rinder_survey.sql`
6. `backend/rinder_survey_questions.sql`
7. `backend/rinder_survey_responses.sql`
8. `backend/rinder_experiment_registrations.sql`

For example, for each file:

```sh
mysql -u YOUR_LOCAL_USER -p rinder < backend/rinder_users.sql
```

The dumps include table replacement statements and sample data. Import them only into a disposable development database. Do not mix them with the alternate schema in `backend/flask_backend/rinder.sql` or the older dumps.

### 3. Install and configure the backend

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install Flask Flask-Cors Flask-MySQLdb
```

The project does not include a pinned Python dependency manifest. The command above installs the packages imported by the main API; it is not a reproducible Python lockfile.

`backend/flask_app.py` currently defines MySQL connection settings and the Flask session key directly in the source. Review these settings and configure them for your local database before running the backend. Environment-variable configuration is not currently implemented. Do not reuse the bundled credentials or session key for deployment.

Start the API:

```sh
python backend/flask_app.py
```

The API uses port **8080**. The development entry point enables Flask debug mode.

### 4. Start the frontend

In a second terminal, from the project root:

```sh
npm run dev -- --port 5173 --strictPort
```

Use the frontend through the `localhost` hostname on port **5173**. The API permits that exact frontend origin for credentialed CORS requests, and the frontend hardcodes API requests to `http://localhost:8080`.

For a remote cloud workspace, these localhost addresses refer to the browser's own machine. Remote browser access requires suitable forwarding or a separate API URL and CORS configuration change.

## Build and validation

```sh
npm run build
npm run preview
```

The build command generates frontend assets in `dist/`. Preview serves the frontend build; it does not start Flask or MySQL.

No automated test, lint, or type-check scripts are declared in the root `package.json`. With MySQL and Flask running, a useful initial API check is:

```sh
curl --fail http://localhost:8080/api/projects
```

Expect a JSON list of experiments. A successful frontend build alone does not verify database connectivity, authentication, or participation workflows. Manually check registration, login, experiment registration, survey submission, calendar display, and profile history before claiming full application readiness.

## Current limitations

- Database credentials, the session key, API addresses, and the allowed frontend origin are hardcoded.
- Python dependency versions are not pinned.
- Multiple frontend, backend, and schema variants are bundled; use the main paths documented above.
- The included Flask debug server is intended for local development. Production deployment requires separate configuration and validation.
