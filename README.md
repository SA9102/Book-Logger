# :books: Book Logger

A simple application for creating and storing books that a user has read, wants to read, or is currently reading.

Users can create an account to store their books information.

## :bulb: Information

After doing some tutorials and learning about different concepts including routing, authentication, managing user roles and the EJS view engine, this was my first attempt in creating a Node and Express project on my own, that uses authentication and CRUD operations. Because of this, this project was challenging to make. What made it more challenging were obstacles that I did not anticipate first. For example, implementing PUT and DELETE requests was not as straightforward, since you can only send GET and POST requests from HTML forms. Nonetheless, building this application has been fun, and has given me the basic skills to create simple CRUD applications with authentication using Express. I have also learnt how to organise an Express project using the MVC pattern.

Here are some positive outcomes from creating this project:

- Learnt how to send PUT and DELETE requests from HTML forms using the method-override package
- Learnt about authentication using Passport.js with local strategy
- Learnt about how to manage user roles
- Deepened understanding of how middleware works

Also, I understand that the code in this project may not be very efficient or follow best practises. But with every project I make, I try to practise and improve the way I code.

## :desktop_computer: Tech Stack:

- Node.js
- Express.js
- MongoDB

## :package: Dependencies:

- Mongoose (ODM for performing ...)
- EJS (view engine)
- Passport.js and passport-local (implementing simple and secure authentication with passwords)
- bcrypt (hashing passwords)
- express-session (for mainta)
- express-flash (sending feedback when login fails)
- method-override (allowing HTML forms to send PUT and DELETE requests)
- dotenv (accessing environment variables)
