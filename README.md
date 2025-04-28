# CS372 Semester Project

### Kohlby V., Andrew W., Elliott L.

This is the repository containing a semester project for CS372 at the University of Alaska Fairbanks

## Required Hardware And Software:

- You will need a computer to host the project
- MongoDB must be installed on your computer

### Installing MongoDB

Instructions for the installation of MongoDB can be found on the [official MongoDB website](https://www.mongodb.com/docs/manual/installation/).

# Installing Dev Dependencies

To ensure you have all dependencies properly installed, run `npm install`

# Local file setup

You will need to create a file named `.env` in the root directory of this project with the following fields:

```
SESSION_KEY="your_key_here"
DB_NAME="your_db_name"
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

# Running Our Website

1. Run the MongoDB databse
2. Initialze the server node
3. Access the website on any web browser of your choice at port 4200 of your machine

## The Login Page

When accessing our website, the first page you land on will always be the login page.

If you have an account, you can log into it using the login textboxes at the top of the page.

If you don't have an accuont, you can create one using the textboxes for creating an account at the bottom of the page.

## The Gallery Page

Once you have succesfully logged in, you will be brought to our gallery page. The content displayed on this page will differ depending on the type of account you have.

All accounts will have access to:

- The search bar! Enter text here and click the search button to find videos related to the text you entered.
- The favorites button! Clicking on this button will display all of your favorited videos to the page.
- Videos! If you would like to watch a video, clicking on it will take you to a separate page where you can view that video.

Users with video editor accounts will also see a "Video Tools Suite" button on the gallery page. Clicking on this will take you to the Video Tools Suite Page.

## The Video Viewer Page

Clicking on a video from the gallery will take you to this page. All accounts will see the video they selected, in addition to buttons which they may use to like or dislike the video.

Clicking on the "like" button will add that video to your account's favorites list.

Clicking on the "Take me back to the gallery" button will return you to the gallery page.

Marketing Manager accounts will have access to a text box under the video which they can use to leave comments for video editors.

Video Editor accounts will see comments from marketing managers displayed underneath the video.

## The Video Tools Suite Page

Clicking on the "Video Tools Suite" button in the gallery will take you to this page.

From this page, users with video editor accounts can upload, edit, and remove videos.

- Video uploading can be performed by inputting the name of your video, a youtube embed link to your video, and an image link to the thumbnail of your video in the respective textboxes for video upload.
- Video removal can be performed by inputting the name of the video you wish to remove.
- Video editing can be performed by inputting the name of the video you wish to edit, and then the new parameters for your video in their respective textboxes.

# Thank You For Visiting Our Website!
