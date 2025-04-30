# CS372 Semester Project

### Kohlby V., Andrew W., Elliott L.

This is the repository containing a semester project for CS372 at the University of Alaska Fairbanks

# Installing Dev Dependencies

To ensure you have all dependencies properly installed, run `npm install`

# Local file setup

You will need to create a file named `.env` in the root directory of this project with the following fields:

```
SESSION_KEY="your_key_here"
DB_NAME="importantDatabase"
DB_URI="mongodb://localhost:27017"
```

# Setting up the Mongodb Database with dummy values

## User Account Creation:

### Viewer Account

```
Username: viewer@gmail.test
Password: Test123!

db.users.insertOne({
    username: "viewer@gmail.test",
    password: "54de7f606f2523cba8efac173fab42fb7f59d56ceff974c8fdb7342cf2cfe345",
    login_tally: 0,
    role: 0,
    favorites: [],
    disfavorite: [],
    }
)
```

### Content Editor Account

```
Username: editor@test.test
Password: Test123!

db.users.insertOne({
    username: "editor@gmail.test",
    password: "54de7f606f2523cba8efac173fab42fb7f59d56ceff974c8fdb7342cf2cfe345", login_tally: 0,
    role: 1,
    favorites: [],
    disfavorite: [],
    }
)
```

### Marketing Manager Account

```
Username: manager@test.test
Password: Test123!

db.users.insertOne({
    username: "manager@gmail.test",
    password: "54de7f606f2523cba8efac173fab42fb7f59d56ceff974c8fdb7342cf2cfe345",
    login_tally: 0,
    role: 2,
     favorites: [],
     disfavorite: [],
     }
)
```

## Video creation command:

```
db.videos.insertOne({
    name: "test",
    url: "https://www.youtube.com/embed/M5FGuBatbTg?si=W25JyYlJveMuvbi3", likes: 0,
    dislikes: 0,
    comment: "This is a comment"
    thumbnail: "https://cdn.pixabay.com/photo/2024/12/24/10/04/kitchen-9288111_960_720.jpg"
    }
)
```

# Linting with ESLint

To run ESLint on all files use command `npx eslint`

To run ESLint on specific files use `npx eslint <file>`

# Formatting with Prettier

To format all files in the project run `npx prettier --write .`

- Be careful, this will overwrite files so if you run this with unsaved changes things might get wacky

To format a single file run `npx prettier --write <file/dir>`
