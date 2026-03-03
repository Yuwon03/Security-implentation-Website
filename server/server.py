from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room
import sqlite3
from sqlite3 import Error
import uuid
import os
import ssl
from datetime import datetime, timezone
from argon2 import PasswordHasher

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.after_request
def add_security_headers(response):
    # Add HSTS header to enforce HTTPS
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

@app.route('/api/ping')
def ping():
    return jsonify(msg="pong")

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    salt_len=16,
    hash_len=32,
)

def create_connection():
    """ Create a database connection to the SQLite database """
    conn = None
    try:
        conn = sqlite3.connect('chat_app.db')
        return conn
    except Error as e:
        print(e)
    return conn

def create_tables():
    """ Create the necessary tables if they don't exist """
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            
            c.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    salt TEXT NOT NULL, 
                    password TEXT NOT NULL,
                    public_key TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            c.execute('''
                CREATE TABLE IF NOT EXISTS chats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    name TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''') #id, 그룹또는 개인 구분, 채팅이름, 생성일

            c.execute('''
                CREATE TABLE IF NOT EXISTS chat_participants (
                      chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                      user_id TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
                      PRIMARY KEY (chat_id, user_id)
                )
            ''')

            c.execute('''
                CREATE TABLE IF NOT EXISTS plainmessages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                    sender_id TEXT NOT NULL REFERENCES users(username),
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            c.execute('''
                CREATE TABLE IF NOT EXISTS e2eemessages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                    sender_id TEXT NOT NULL REFERENCES users(username),
                    iv TEXT NOT NULL,
                    ct TEXT NOT NULL,
                    tag TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            c.execute('''
                CREATE TABLE IF NOT EXISTS dashboard (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            c.execute('''
                CREATE TABLE IF NOT EXISTS timetable (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL,
                    day TEXT NOT NULL,
                    time TEXT NOT NULL,
                    duration INTEGER NOT NULL,
                    content TEXT NOT NULL
                )
            ''')
            c.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id               INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_id         INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                    participant_name TEXT    NOT NULL,
                    task_name        TEXT    NOT NULL,
                    deadline         DATE    NOT NULL,
                    status           TEXT    NOT NULL DEFAULT 'In Progess',
                    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(group_id, task_name)
                )
            ''')
            conn.commit()
            print("Database tables created successfully")
        except Error as e:
            print(e)
        finally:
            conn.close()
    else:
        print("Error: Could not create database connection")

create_tables()

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Hello world!",
        'people': ["David", "Choi"]
    })

@app.route("/api/login", methods=['POST'])
def login():
    print("login successful")
    data = request.json
    username = data.get('username')
    hash_password = data.get('password')
    
    if not username or not hash_password:
        return jsonify({"error": "Missing username or password"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT username, salt, password FROM users WHERE username = ?", (username,))
            user = c.fetchone()
            
            if not user:
                return jsonify({"error": "Invalid username or password"}), 401

            token = str(uuid.uuid4())
            user_db, salt, hash = user

            try:
                ph.verify(hash, hash_password + salt)
                return jsonify({
                    "success": True,
                    "token": token,
                    "username": username,
                    "message": "Successfully signed in"
                })
            except:
                return jsonify({"error": "Invalid username or password"}), 401
            
        except Error as e:
            print(e)
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/signup", methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    first_hash = data.get('password')
    public_key = data.get('publicKey')
    
    if not username or not first_hash:
        return jsonify({"error": "Missing username or password"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT username FROM users WHERE username = ?", (username,))
            if c.fetchone():
                return jsonify({"error" : "Username already exists"}), 409
            
            salt = os.urandom(16).hex()
            second_hash = ph.hash(first_hash + salt)

            c.execute(
                "INSERT INTO users (username, salt, password, public_key) VALUES (?, ?, ?, ?)",
                (username, salt, second_hash, public_key)
            )
            conn.commit()

            return jsonify({
                "success": True,
                "username": username,
                "message": "User registered successfully"
            }), 201
        except Error as e:
            print(e)
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    return jsonify({"error": "Server error"}), 500

@app.route("/api/getchats", methods=['GET'])
def getchats():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Missing username"}), 400
    conn = create_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        row = c.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        user_id = row[0]

        c.execute("""
            SELECT c.id, c.name, c.type
            FROM chats c
            JOIN chat_participants cp ON c.id = cp.chat_id
            WHERE cp.user_id = ?
            ORDER BY c.created_at DESC
        """, (user_id,))
        chats = c.fetchall()

        result = []
        for chat_id, name, chat_type in chats:
            c.execute("""
                SELECT u.username
                FROM users u
                JOIN chat_participants cp ON u.id = cp.user_id
                WHERE cp.chat_id = ?
            """, (chat_id,))
            participant_usernames = [r[0] for r in c.fetchall()]

            msgs = []
            if chat_type == 'private':
                c.execute("""
                  SELECT u.username, em.iv, em.ct, em.tag, em.timestamp
                  FROM e2eemessages em
                  JOIN users u ON em.sender_id = u.username
                  WHERE em.chat_id = ?
                  ORDER BY em.timestamp ASC
                """, (chat_id,))
                for sender_name, iv, ct, tag, ts in c.fetchall():
                    print(sender_name, iv, ct, tag, ts)
                    msgs.append({
                        "sender":    sender_name,
                        "iv":        iv,
                        "ct":        ct,
                        "tag":       tag,
                        "timestamp": ts
                    })
                print(msgs)
            else:
                c.execute("""
                  SELECT u.username, pm.content, pm.timestamp
                  FROM plainmessages pm
                  JOIN users u ON pm.sender_id = u.username
                  WHERE pm.chat_id = ?
                  ORDER BY pm.timestamp ASC
                """, (chat_id,))
                for sender_name, content, ts in c.fetchall():
                    msgs.append({
                        "sender":    sender_name,
                        "content":   content,
                        "timestamp": ts
                    })

            display_name = name
            if chat_type == "private":
                others = [u for u in participant_usernames if u != username]
                if others:
                    display_name = others[0]
            result.append({
                "chat_id":      chat_id,
                "name":         display_name,
                "type":         chat_type,
                "participants": participant_usernames,
                "messages":     msgs
            })
        
        return jsonify(result), 200

    except Error as e:
        print("DB error in getchats:", e)
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()


@app.route("/api/addchats", methods=['POST'])
def add_chats():
    data = request.json
    chatName = data.get('chatName')
    chatType = data.get('chatType')
    usernames = data.get('usernames')

    if not chatName or not chatType or not usernames:
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO chats (name, type) VALUES (?, ?)", (chatName, chatType))
            chat_id = c.lastrowid

            for username in usernames:
                c.execute("SELECT id FROM users WHERE username = ?", (username,))
                row = c.fetchone()
                if not row:
                    conn.rollback()
                    return jsonify({"error": "User not found"}), 404
                user_id = row[0]
                c.execute("INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)", (chat_id, user_id))
            conn.commit()

            return jsonify({
                "success": True,
                "message": "Chat created successfully"
            }), 201
                
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()

    return jsonify({"error": "Server error"}), 500

@socketio.on('join')
def on_join(data):
    join_room(f"chat_{data['chat_id']}")

@app.route("/api/sendmessageplain", methods=['POST'])
def sendmessageplain():
    data = request.json
    message = data.get('message')
    chat_id = data.get('chatId')
    username = data.get('username')

    if not message or not chat_id or not username:
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO plainmessages (chat_id, sender_id, content) VALUES (?, ?, ?)", (chat_id, username, message))
            conn.commit()
            room = f"chat_{chat_id}"
            socketio.emit('new_message', {
                'chat_id': chat_id,
                'sender': username,
                'content': message,
                'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }, room=room)
            return jsonify({"success": True}), 200
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/sendmessagee2ee", methods=['POST'])
def sendmessagee2ee():
    data = request.json
    chat_id = data.get('chatId')
    iv = data.get('iv')
    ct = data.get('ct')
    tag = data.get('tag')
    username = data.get('username')
    print(chat_id, iv, ct, tag, username)
    if not chat_id or not iv or not ct or not tag or not username:
        return jsonify({"error": "Missing required fields"}), 400
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO e2eemessages (chat_id, sender_id, iv, ct, tag) VALUES (?, ?, ?, ?, ?)", (chat_id, username, iv, ct, tag))
            conn.commit()

            room = f"chat_{chat_id}"
            
            socketio.emit('new_message', {
                'chat_id': chat_id,
                'sender': username,
                'iv': iv,
                'ct': ct,
                'tag': tag,
                'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }, room=room)
            return jsonify({"success": True}), 200
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()

    return jsonify({"error": "Server error"}), 500

@app.route("/api/getPublicKey", methods=['GET'])
def getPublicKey():
    username = request.args.get('username')
    print(username)
    if not username:
        return jsonify({"error": "Missing username"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT public_key FROM users WHERE username = ?", (username,))
            row = c.fetchone()
            if not row:
                return jsonify({"error": "User not found"}), 404
            public_key = row[0]
            return jsonify({"publicKey": public_key}), 200
        except Error as e:
            print(e)
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()

    return jsonify({"error": "Server error"}), 500

@app.route("/api/getdashboard", methods=['GET'])
def getdashboard():
    print("reached here")
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT * FROM dashboard")
            rows = c.fetchall()
            result = []
            for dashboard in rows:
                result.append({
                    "id": dashboard[0],
                    "username": dashboard[1],
                    "title": dashboard[2],
                    "content": dashboard[3],
                    "created_at": dashboard[4]
                })
            print(result)
            return jsonify(result), 200
        except Error as e:
            print(e)
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/addDashboard", methods=['POST'])
def addDashboard():
    data = request.json
    username = data.get('username')
    title = data.get('title')
    content = data.get('content')

    if not username or not title or not content:
        return jsonify({"error": "Missing required fields"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO dashboard (username, title, content) VALUES (?, ?, ?)", (username, title, content))
            conn.commit()
            return jsonify({"success": True, "message": "Dashboard added successfully"}), 201
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/gettimetable", methods=['GET'])
def gettimetable():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Missing username"}), 400
    
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT * FROM timetable WHERE username = ?", (username,))
            rows = c.fetchall()
            result = []
            for timetable in rows:
                result.append({
                    "id": timetable[0],
                    "username": timetable[1],
                    "day": timetable[2],
                    "time": timetable[3],
                    "duration": timetable[4],
                    "content": timetable[5]
                })
            print(result)
            return jsonify(result), 200
        except Error as e:
            print(e)
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/addtimetable", methods=['POST'])
def addtimetable():
    print("reached here")
    data = request.json
    username = data.get('username')
    day = data.get('day')
    time = data.get('time')
    duration = data.get('duration')
    content = data.get('content')

    if not username or not day or not time or not duration or not content:
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO timetable (username, day, time, duration, content) VALUES (?, ?, ?, ?, ?)", (username, day, time, duration, content))
            conn.commit()
            return jsonify({"success": True, "message": "Timetable added successfully"}), 201
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500

@app.route("/api/deletetimetable", methods=['DELETE'])
def deletetimetable():
    print("reached here")
    data = request.json
    print("reached here 2")
    id = data.get('id')
    username = data.get('username')
    print(1)
    print(id, username)
    print(2)
    if not id or not username:
        return jsonify({"error": "Missing required fields"}), 400
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("DELETE FROM timetable WHERE id = ? AND username = ?", (id, username))
            conn.commit()
            return jsonify({"success": True, "message": "Timetable deleted successfully"}), 200
        except Error as e:
            print(e)
            conn.rollback()
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Server error"}), 500
            
@app.route("/api/getgroups", methods=['GET'])
def getgroups():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Missing username parameter"}), 400

    conn = create_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        row = c.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        user_id = row[0]

        c.execute("""
            SELECT
              c.id,
              c.name,
              GROUP_CONCAT(u.username) AS participants
            FROM chats c
            JOIN chat_participants cp_filter
              ON c.id = cp_filter.chat_id
             AND cp_filter.user_id = ?
            JOIN chat_participants cp
              ON c.id = cp.chat_id
            JOIN users u
              ON cp.user_id = u.id
            WHERE c.type = 'group'
            GROUP BY c.id, c.name
            ORDER BY c.created_at DESC
        """, (user_id,))

        groups = []
        for chat_id, name, participants_csv in c.fetchall():
            participants = participants_csv.split(',') if participants_csv else []
            groups.append({
                "id": chat_id,
                "name": name,
                "participants": participants
            })

        return jsonify(groups), 200

    except Error as e:
        print("DB error in getgroups:", e)
        return jsonify({"error": "Database error"}), 500

    finally:
        conn.close()

@app.route("/api/addtasks", methods=['POST'])
def addtasks():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Invalid JSON"), 400

    tasks    = data.get('tasks')
    if not isinstance(tasks, list) or not tasks:
        return jsonify(error="Invalid or missing tasks array"), 400

    for t in tasks:
        if not all(k in t for k in ('groupId','participantName','taskName','deadline')):
            return jsonify(error="Each task must include groupId, participantName, taskName, deadline"), 400
    
    conn = create_connection()
    try:
        c = conn.cursor()

        group_id = tasks[0]['groupId']
        c.execute(
            "SELECT task_name FROM tasks WHERE group_id = ?",
            (group_id,)
        )
        existing = {row[0] for row in c.fetchall()}
        duplicates = [t['taskName'] for t in tasks if t['taskName'] in existing]
        if duplicates:
            return jsonify({
                "message":f"Already existing Task names: {', '.join(duplicates)}"
            }), 400
        
        rows = [
            (
             t['groupId'],
             t['participantName'],
             t['taskName'],
             t['deadline']
            )
            for t in tasks
        ]
        c.executemany(
            "INSERT OR IGNORE INTO tasks (group_id, participant_name, task_name, deadline) VALUES (?, ?, ?, ?)",
            rows
        )
        conn.commit()
        return jsonify(success=True, message="Tasks added successfully"), 201

    except Error as e:
        print("DB error in addtasks:", e)
        conn.rollback()
        return jsonify(error="Database error"), 500

    finally:
        conn.close()

@app.route("/api/gettasks", methods=['GET'])
def gettasks():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Missing username"}), 400

    conn = create_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        row = c.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        user_id = row[0]

        c.execute("""
            SELECT cp.chat_id
            FROM chat_participants cp
            JOIN chats c ON cp.chat_id = c.id
            WHERE cp.user_id = ? AND c.type = 'group'
        """, (user_id,))
        group_ids = [r[0] for r in c.fetchall()]

        if not group_ids:
            return jsonify([]), 200
        placeholders = ",".join("?" for _ in group_ids)
        query = f"""
            SELECT
              t.id,
              t.group_id     AS groupId,
              c.name         AS groupName,
              t.participant_name AS participantName,
              t.task_name    AS taskName,
              t.deadline     AS deadline,
              t.status       AS status,
              t.created_at   AS createdAt
            FROM tasks t
            JOIN chats c ON t.group_id = c.id
            WHERE t.group_id IN ({placeholders})
            ORDER BY c.name, t.deadline
        """
        c.execute(query, group_ids)

        result = [
            {
              "id":                row[0],
              "groupId":           row[1],
              "groupName":         row[2],
              "participantName":   row[3],
              "taskName":          row[4],
              "deadline":          row[5],
              "status":            row[6],
              "createdAt":         row[7],
            }
            for row in c.fetchall()
        ]
        print(result)
        return jsonify(result), 200

    except Error as e:
        print("DB error in gettasks:", e)
        return jsonify({"error": "Database error"}), 500

    finally:
        conn.close()

@app.route("/api/updatetaskstatus", methods=['PATCH'])
def updatetaskstatus():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Invalid JSON"), 400

    task_id  = data.get('taskId')
    new_stat = data.get('status') 
    username = data.get('username')
    if not task_id or not new_stat or not username:
        return jsonify(error="Missing required fields"), 400

    conn = create_connection()
    try:
        c = conn.cursor()
        c.execute(
            "UPDATE tasks SET status = ? WHERE id = ?",
            (new_stat, task_id)
        )
        conn.commit()
        c.execute("SELECT group_id FROM tasks WHERE id = ?", (task_id,))
        row = c.fetchone()
        if not row:
            return jsonify(error="Task not found"), 404
        group_id = row[0]

        c.execute(
            "SELECT COUNT(*) FROM tasks WHERE group_id = ? AND status != 'Finished'",
            (group_id,)
        )
        remaining = c.fetchone()[0]

        if remaining == 0:
            c.execute("DELETE FROM tasks WHERE group_id = ?", (group_id,))
            c.execute("SELECT id FROM users WHERE username = ?", (username,))
            c.execute("""
                INSERT INTO plainmessages
                  (chat_id, sender_id, content)
                VALUES (?, ?, ?)
            """, (group_id, username, "Task is Ended!"))
            conn.commit()

        return jsonify(success=True), 200

    except Error as e:
        conn.rollback()
        print("DB error in updatetaskstatus:", e)
        return jsonify(error="Database error"), 500

    finally:
        conn.close()


if __name__ == "__main__":
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.load_cert_chain('localhost+2.pem', 'localhost+2-key.pem')
    socketio.run(app, port=8000, debug=True, ssl_context=context)
