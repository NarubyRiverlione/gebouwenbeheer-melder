# Purpose

Aldo all documentation, variable names and comments in code must be in English the reported issues will be in Dutch. This will be important for phase 2 to analyse the reports.

## 1. Store reported issues

Issues will be reported via an in a structured format (data-format.md) and
should be stored in a database with the datetime of recording and the flag processed and resolved shouldn't be set.

There are api's for :

- adding a report
- get the get the number of unprocessed reports.
- get all reports
- get reports for a certain time until now, optional filter (un)processed and (un)resolved

## 2. Create Issue clusters

There is an api to trigger the processing of the reports.
This process will read all unprocessed reports and bundle them in issue clusters ( see data-format.md). This process will be later on described.

There are api's for :

- get the unresolved issue clusters
- set a issue cluster as resolved, this should also set all related reports as resolved

## 3. Create report from an email
An api will be provided to send the content of an email. The email will be analyzed to find the need structured information to store a report. If mandatory information isn't found then this will be in the response of the api.

# Technical

## Main stack

- nodeJs with Typescript
- eslint flat config with prettier
- pnpm instead of npm
- use node LTS version via nvm
- sql lite as database
- expressJS as API endpoints

### Code style

- Don't use the 'any' type
- Strongly prefer the use of 'const' above 'let'
- use a modular design with small files aim for 100 lines, 200 max
- (business) Logic should be in a separated file
- after making changes always check of problems via running the linter script
- don't use a trailing ;
