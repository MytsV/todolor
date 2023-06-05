# Todolor

## Table of contents
* [General description](#general-description)
* [Setup and usage](#setup-and-usage)
* [Troubleshooting](#troubleshooting)
* [Contribution](#contribution)

## General description
Dolor is a state of great sorrow or distress. 
That's what we feel like looking at our todo lists.
CLI task manager **todolor** won't help anyone with that, but cheesy motivational quotes seemed like a fun concept.\
Виконаний як лабораторна робота №4 з предмету "МТРПЗ" 
- Миць Вікторією, група ІМ-12.
- Барицькою Світланою, група ІМ-12.

## Setup and usage
To run this project, make sure you have the latest version of [Node.js and npm](https://nodejs.org/en/download) installed.

To use the project as
```
todolor
```
globally, you may just install this way (run it as a root!):
```
npm i -g https://github.com/MytsV/todolor
```

Alternatively, you can clone it onto your local device or [use repository's codespace](https://mytsv-ominous-meme-g6w5pwx9w4w2w4q4.github.dev/).
Then, to run the program:
```bash
# First, install the packages
npm i
# Use npm start with -- to pass arguments
npm start -- ls --overdue
```
To use it globally as `todolor`, execute:
```
npm link
```
To display the list of available commands, run:
```
todolor help
```
To run tests, from root directory of the project execute:
```
npm test
```

## Troubleshooting
When trying to run the program globally, you may face the following error on Windows:
"execution of scripts is disabled on this system".
Refer to [this stackoverflow answer](https://ru.stackoverflow.com/questions/935212/powershell-%D0%B2%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D0%B8%D0%B5%D0%B2-%D0%BE%D1%82%D0%BA%D0%BB%D1%8E%D1%87%D0%B5%D0%BD%D0%BE-%D0%B2-%D1%8D%D1%82%D0%BE%D0%B9-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B5) for a fix.

## Contribution
The master branch is push protected. You'll need to open a pull request and wait for at least one review before the merge. Please, make sure that all the tests pass and check the formatting with
```
npm run lint-check
```
