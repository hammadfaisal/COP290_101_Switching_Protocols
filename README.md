To Run
1. In the frontend directory
    - run `npm install` to install dependencies
    - then either `npm run build` to build the project followed by `npm start` or `npm run dev` to run the project in development mode
2. In the backend directory
    - run `python3 -m venv venv` to create a virtual environment
    - run `source venv/bin/activate` to activate the virtual environment
    - run `pip install -r requirements.txt` to install dependencies
    - set environment variables `SECRET` for JWT secret key, `DBUSER` for database username, `DBPASS` for database password and `OPENAI_API_KEY` for openai api key
    - name of the database should be `cop` running on `localhost:3306`
    - run `python app/app.py` to run the project
    
## Directory Structure
- `frontend/` contains the frontend code
    - `src/` contains the pages and components
    - `public/` contains the static files
- `backend/` contains the backend code
    - `app/` contains the flask app
        - `tests/` contains the integration tests
        - `uploads/` contains the uploaded files
    - `htmlcov/` contains the coverage report
- `swagger_documenation.yaml` contains the swagger documentation