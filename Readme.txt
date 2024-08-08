first i run the command to initialize my project 
 -- npm init


packages in backend --
    1. express
    2. mongoose
    3. nodmeon
    4. json web token
    5. bcryptjs
    6. cookie-parser
    7. cors

add "type" : "module" in package.js

now for listen the backend create index.js

listening function be like:-
const PORT = 8000;
app.listen(PORT,() => {
    console.log(`Server listen at port ${PORT}`);
})


make mongodb user and clustor by creating new project 
pass hnPtfBn9087cfKYm

now i create a models folder for creating the all models
creater user model/schema in user.model.js
create post model/schema
-------message
-------conversation
-------commment