# web application in MVC (Web API enabled) using bootstrap and use SQL as DB

> User can register them self

## Tools Use

- Node js
- Express
- PostreSQL as SQL DB
- Nodemailer (for mail send)
- Pug (for View)

## Functionality

- Registration
- Email based verification
- Login
- User Profile
- Admin Role
- Fetch All user (Only admin have allow)

## How to Run

Add .env file and update values/setting to your own

```
NODE_ENV=development
PORT=5000

DB_URL=
DB_USER=postgres
DB_PASS=
DB_NAME=
DB_HOST=127.0.0.1
DB_DIALECT=postgres

JWT_SECRET=
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_NAME=
FROM_EMAIL=
```

## Install Dependencies

```
# Inside project_folder
npm install
```

## Run App

```
# Run Project
npm run dev
```

## Access

```
 # Access the web app in browser:
 http://localhost:5000

```
