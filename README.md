# Geography quiz Web app
Takes written input of user answer to random country query. 10 questions at a time with intermission feedback and option to continue. Final results page still in development.
> - All user data is stored in session. No JavaScript global variables that user can manipulate except resetScore() to reset all progress.
> - Frontent written in JavaScript and Jinja templates.
> - Backend and admin written in Python and Django.
**Four complete quizzes**
> - Guess country from flag
> - Guess capital from flag
> - Guess capital from country
> - Guess country from capital
**Planned additions**
> - Mixed quiz that randomly chooses between above 4 quizzes and each country.
> - Considering future addition that will tracks user progress.
**Admin page**
Simple interface for superusers. Takes CSV as input to manage and make changes to quiz data in database: flags, countries, capitals and hints. Easy to manage and allows to changes to all. See image
## Image gallery
**Guess country from flag - showing blank entry form and submit button**
Tabs at top navigate between quizzes.
<img width="1262" height="867" alt="Guess country from flag" src="https://github.com/user-attachments/assets/2a5d10c2-fed9-49c1-8994-154c6b1fe383" />
**Guess capital from flag - showing positive feedback to user guess and next button**
<img width="1262" height="867" alt="image" src="https://github.com/user-attachments/assets/b1ca43a3-67a0-4f81-95b7-ff348f9106a1" />
**Guess capital from country - showing form with user entry and submit button**
<img width="1262" height="667" alt="image" src="https://github.com/user-attachments/assets/c52d50d5-ed29-4529-b2f9-791ad92b4495" />
**Guess country from capital - showing negative feedback to user guess and next button**
<img width="1262" height="667" alt="image" src="https://github.com/user-attachments/assets/01439920-20de-48d3-982d-0fe8497c8595" />
**Admin page**
The admin page is accessed by the default Django login page path, no hyperlink in GUI. The CSV changes have to made on the server import_data.csv file.
<img width="1362" height="1062" alt="admin interface showing changes at top" src="https://github.com/user-attachments/assets/f9d4b755-fc90-472e-b8d9-2d11faa93453" />
**Admin login page**
<img width="1262" height="382" alt="image" src="https://github.com/user-attachments/assets/f6496674-3dd9-4021-a127-e95057dcdaf3" />
