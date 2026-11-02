import os

from flask import Flask, request, jsonify
import pymysql

app = Flask(__name__)


def get_db_connection():
    return pymysql.connect(
        host=os.environ.get("MYSQL_HOST", "localhost"),
        user=os.environ.get("MYSQL_USER", "rinder"),
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ.get("MYSQL_DB", "rinder"),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route("/")
def home():
    return "Flask is running!"

@app.route("/api/survey/questions", methods=["POST"])
def create_survey_question():
    data = request.get_json()

    project_id = data.get("project_id")
    question_text = data.get("question_text")
    question_type = data.get("question_type")

    conn = get_db_connection()
    cur = conn.cursor()

    sql = """
        INSERT INTO survey_questions (project_id, question_text, question_type)
        VALUES (%s, %s, %s)
    """
    cur.execute(sql, (project_id, question_text, question_type))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Question saved successfully"}), 201

if __name__ == "__main__":
    app.run(debug=True)

