import os

# 
#   Flask Backend Application
#   Team: Group J
#   Description: API for research project management, user registration, and authentication.
#

from flask import Flask, request, jsonify, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import json

app = Flask(__name__)
app.secret_key = os.environ["FLASK_SECRET_KEY"]
if not app.secret_key:
    raise RuntimeError("FLASK_SECRET_KEY must be a nonempty environment variable")

def login_required(f):
    """
    This method is a decorator to protect routes that require user authentication, such as creating projects or surveys.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            print("[UNAUTHORIZED] Attempt to access protected route without login.")
            return jsonify({"error": "Login required to perform this action"}), 401
        return f(*args, **kwargs)
    return decorated_function

# CORS Configuration for frontend-backend communication between Flask and React servers
CORS(app, supports_credentials=True, origins=["http://localhost:5173"]) 

# MySQL Configuration
app.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST", "localhost")
app.config["MYSQL_USER"] = os.environ.get("MYSQL_USER", "rinder")
app.config["MYSQL_PASSWORD"] = os.environ["MYSQL_PASSWORD"]
app.config["MYSQL_DB"] = os.environ.get("MYSQL_DB", "rinder")
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

# --- USER REGISTRATION ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    lastname = data.get('lastname')
    firstname = data.get('firstname')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'student')
    
    print(f"\n[REGISTER ATTEMPT] User: {username}, Last Name: {lastname}, First Name: {firstname}, Email: {email}, Type: {user_type}")
    
    hashed_pw = generate_password_hash(password)

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO users (username, lastname, firstname, email, password_hash, user_type) 
            VALUES (%s, %s, %s, %s, %s, %s)""", 
            (username, lastname, firstname, email, hashed_pw, user_type))
        
        user_id = cur.lastrowid 

        if user_type == 'student':
            cur.execute("INSERT INTO students (user_id) VALUES (%s)", (user_id,))
        else:
            cur.execute("INSERT INTO professors (user_id) VALUES (%s)", (user_id,))

        mysql.connection.commit()
        cur.close()
        
        print(f"[SUCCESS] User {username} registered successfully.")
        return jsonify({"status": "success", "message": "User registered"}), 201
        
    except Exception as e:
        print(f"[ERROR] Registration failed: {str(e)}")
        return jsonify({"error": str(e)}), 400

# --- USER LOGIN ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    print(f"\n[LOGIN ATTEMPT] User: {username}") 
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, username))
    user = cur.fetchone()
    cur.close()

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = int(user['id']) 
        session['username'] = user['username']
        session.modified = True 
        
        user_data = {
            "id": user['id'],
            "username": user['username'],
            "firstname": user['firstname'],
            "lastname": user['lastname'],
            "email": user['email']
        }
        print(f"[SUCCESS] User logged in: {user_data}")
        return jsonify(user_data), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# --- USER LOGOUT ---
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    username = session.get('username', 'Unknown')
    session.clear()
    print(f"\n[LOGOUT] User {username} logged out.")
    return jsonify({"message": "Logged out successfully"}), 200

# --- CREATE PROJECT ---
@app.route('/api/add_project', methods=['POST'])
@login_required
def add_project():
    data = request.get_json()
    
    print("\n[PROJECT CREATION ATTEMPT]")
    print(f"Title: {data.get('title')}")
    print(f"Lab: {data.get('labName')}")

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO research_projects (
                project_id, title, description, lab_name, status, 
                max_participants, start_date, end_date, 
                eligibility_criteria, study_type, is_recruiting, creator_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
            (
                data.get('projectId'),
                data.get('title'), 
                data.get('description'),
                data.get('labName'), 
                data.get('status'), 
                data.get('maxParticipants'),
                data.get('startDate'), 
                data.get('endDate'),
                data.get('eligibilityCriteria'), 
                data.get('studyType'),
                1 if data.get('isRecruiting') else 0,
                data.get('creator_id')
            ))

        mysql.connection.commit()
        cur.close()
        
        print("[SUCCESS] Project saved to database.")
        return jsonify({"message": "Project created successfully!"}), 201
        
    except Exception as e:
        print(f"[ERROR] Database insert failed: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# --- GET ALL PROJECTS ---
@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM research_projects WHERE study_type = 'experiment'")
        projects = cur.fetchall()
        cur.close()
        
        return jsonify(projects), 200
    except Exception as e:
        print(f"[ERROR] Could not fetch projects: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# --- GET CALENDAR EVENTS (both surveys and experiments) ---
@app.route('/api/calendar_events', methods=['GET'])
def get_calendar_events():
    try:
        cur = mysql.connection.cursor()
        
        cur.execute("SELECT * FROM research_projects")
        experiments = cur.fetchall()
        
        query = """
            SELECT 
                survey_id AS project_id, 
                title, 
                lab, 
                'survey' AS study_type, 
                open_date AS start_date, 
                due_date AS end_date 
            FROM survey
            
            UNION ALL
            
            SELECT 
                project_id, 
                title, 
                lab_name AS lab, 
                study_type, 
                start_date, 
                end_date 
            FROM research_projects
        """
        
        cur.execute(query)
        combined_events = cur.fetchall()
        cur.close()
        
        return jsonify(combined_events), 200
    except Exception as e:
        print(f"[ERROR] Calendar fetch failed: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# --- GET SINGLE PROJECT BY ID ---
@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project_detail(project_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM research_projects WHERE project_id = %s", (project_id,))
        project = cur.fetchone()
        cur.close()
        
        if project:
            return jsonify(project), 200
        return jsonify({"error": "Project not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CREATE SURVEY WITH QUESTIONS ---
@app.route('/api/add_survey', methods=['POST'])
@login_required
def add_survey():
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        
        cur.execute("""
            INSERT INTO survey (title, lab, survey_owner, open_date, due_date, eligibility_criteria, creator_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'], 
            data['lab'], 
            data['owner'], 
            data.get('openDate'), 
            data.get('dueDate'), 
            data.get('eligibility'), 
            data.get('creator_id') 
        ))
        
        survey_id = cur.lastrowid

        for i, q in enumerate(data['questions']):
            cur.execute("""
                INSERT INTO survey_questions (survey_id, content, question_type, question_number)
                VALUES (%s, %s, %s, %s)
            """, (survey_id, q['content'], q['type'], i + 1))
        
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Survey created successfully"}), 201
    except Exception as e:
        print(f"Backend Error: {e}") 
        return jsonify({"error": str(e)}), 500
    
# --- GET ALL SURVEYS ---
@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM survey ORDER BY created_at DESC")
        surveys = cur.fetchall()
        cur.close()
        return jsonify(surveys), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- GET SURVEY DETAILS & QUESTIONS ---
@app.route('/api/surveys/<int:survey_id>', methods=['GET'])
def get_survey_details(survey_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM survey WHERE survey_id = %s", (survey_id,))
        survey = cur.fetchone()
        
        if not survey:
            return jsonify({"error": "Survey not found"}), 404

        cur.execute("SELECT * FROM survey_questions WHERE survey_id = %s ORDER BY question_number ASC", (survey_id,))
        questions = cur.fetchall()
        cur.close()

        survey['questions'] = questions
        return jsonify(survey), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# -- GET USER PARTICIPATION AND OWNERSHIP HISTORY ---
@app.route('/api/user_history/<int:user_id>', methods=['GET'])
@login_required
def get_user_history(user_id):
    if session.get('user_id') != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT s.survey_id, s.title, 'survey' as type, r.created_at as date, 'completed' as status
            FROM survey s 
            JOIN survey_responses r ON s.survey_id = r.survey_id
            WHERE r.user_id = %s
        """, (user_id,))
        surveys_taken = cur.fetchall()

        cur.execute("""
            SELECT survey_id, title, 'survey' as type, created_at as date, 'owner' as status 
            FROM survey 
            WHERE creator_id = %s
        """, (user_id,))
        owned_surveys = cur.fetchall()

        cur.execute("""
            SELECT project_id, title, 'experiment' as type, created_at as date, 'owner' as status 
            FROM research_projects 
            WHERE creator_id = %s
        """, (user_id,))
        owned_projects = cur.fetchall()
        cur.close()
        all_owned = owned_surveys + owned_projects

        return jsonify({
            "history": surveys_taken, 
            "owned": all_owned,
            "stats": {
                "surveys": len(surveys_taken),
                "experiments": 0, 
                "created": len(all_owned)
            }
        }), 200
    except Exception as e:
        print(f"Profile Backend Error: {e}")
        return jsonify({"error": str(e)}), 500
    
# --- GET SURVEY RESPONSES (OWNER ONLY) ---
@app.route('/api/surveys/<int:survey_id>/results', methods=['GET'])
@login_required
def get_survey_results(survey_id):
    try:
        cur = mysql.connection.cursor()
        
        cur.execute("SELECT creator_id, title FROM survey WHERE survey_id = %s", (survey_id,))
        survey = cur.fetchone()
        if not survey or survey['creator_id'] != session.get('user_id'):
            return jsonify({"error": "Unauthorized"}), 403

        cur.execute("SELECT question_id, content FROM survey_questions WHERE survey_id = %s", (survey_id,))
        questions = cur.fetchall()

        cur.execute("SELECT response_data FROM survey_responses WHERE survey_id = %s", (survey_id,))
        responses = cur.fetchall()
        total_respondents = len(responses)

        results_summary = []
        for q in questions:
            parts = q['content'].split(' -')
            question_text = parts[0]
            options = parts[1:]
            
            counts = {opt: 0 for opt in options}
            for r in responses:
                res_data = r['response_data']
                if isinstance(res_data, str):
                    res_data = json.loads(res_data)
                
                ans = res_data.get(str(q['question_id']))
                
                if ans:
                    ans = ans.strip()
                    if ans in counts:
                        counts[ans] += 1
            
            formatted_options = {}
            for opt, count in counts.items():
                if total_respondents > 0:
                    percent = round((count / total_respondents * 100), 1)
                else:
                    percent = 0
                formatted_options[opt] = percent

            results_summary.append({
                "question": question_text,
                "percentages": formatted_options 
            })

        cur.close()
        return jsonify({
            "title": survey['title'],
            "total": total_respondents,
            "data": results_summary 
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- SUBMIT SURVEY RESPONSES ---
@app.route('/api/surveys/<int:survey_id>/submit', methods=['POST'])
@login_required
def submit_survey(survey_id):
    data = request.get_json()
    user_id = session.get('user_id')
    answers = data.get('answers') 

    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    try:
        cur = mysql.connection.cursor()
        
        cur.execute("""
            INSERT INTO survey_responses (survey_id, user_id, response_data)
            VALUES (%s, %s, %s)
        """, (survey_id, user_id, json.dumps(answers)))
        
        mysql.connection.commit()
        cur.close()
        
        return jsonify({"message": "Survey submitted successfully!"}), 201
    except Exception as e:
        print(f"Error submitting survey: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
# --- REGISTER FOR EXPERIMENT ---
@app.route('/api/experiments/<project_id>/register', methods=['POST'])
@login_required
def register_experiment(project_id):
    data = request.get_json()
    user_id = session.get('user_id')
    

    try:
        cur = mysql.connection.cursor()
        
        cur.execute("""
            SELECT * FROM experiment_registrations 
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))
        
        if cur.fetchone():
            return jsonify({"error": "You are already registered for this experiment"}), 400

        cur.execute("""
            INSERT INTO experiment_registrations (project_id, user_id, status)
            VALUES (%s, %s, 'registered')
        """, (project_id, user_id))
        
        mysql.connection.commit()
        cur.close()
        
        return jsonify({"message": "Successfully registered!"}), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": "Database error occurred"}), 500
    
# --- GET EXPERIMENT REGISTRANTS (OWNER ONLY) ---
@app.route('/api/experiments/<project_id>/registrants', methods=['GET'])
@login_required
def get_experiment_registrants(project_id):
    try:
        cur = mysql.connection.cursor()
        
        cur.execute("""
            SELECT u.username, u.email, r.registration_date, r.status
            FROM users u
            JOIN experiment_registrations r ON u.id = r.user_id
            WHERE r.project_id = %s
            ORDER BY r.registration_date DESC
        """, (project_id,))
        
        registrants = cur.fetchall()
        cur.close()
        
        return jsonify(registrants), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':

    app.run(debug=True, port=8080)