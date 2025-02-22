from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)
DATA_FILE = "data.json"
app.config['JSON_SORT_KEYS'] = False

@app.route('/')
def home():
    return render_template('index.html') 

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/get_data", methods=["GET"])
def get_data():
    return jsonify(load_data())

@app.route("/update_data", methods=["POST"])
def update_data():
    save_data(request.json)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)
