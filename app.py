from flask import Flask, request, jsonify
from flask_cors import CORS  

app = Flask(__name__)
CORS(app) 


def check_flag(request, flagOriginal: str):
    
    flagUser_data = None
    try:
        flagUser_data = request.get_json()
        
        if flagUser_data is None or "flag" not in flagUser_data:
            return jsonify({"error": "JSON body or 'flag' key missing"}), 400
        
        flagUser = flagUser_data.get("flag")

    except Exception as e:
        return jsonify({"error": f"Bad Request: {str(e)}"}), 400

    if flagUser == flagOriginal:
        return jsonify({"message": "OK"}), 200
    else:
        return jsonify({"message": "Unauthorized"}), 401


@app.post("/flag1")
def formosa_flag():
    flagOriginal = "FLAG{miau-miau-sou-muito-mau}"
    return check_flag(request, flagOriginal)

@app.post("/flag2")
def camboinha_flag():
    flagOriginal = "FLAG{miawlware-melhor-que-caramelo}"
    return check_flag(request, flagOriginal)

@app.post("/flag3")
def areia_vermelha_flag():
    flagOriginal = "FLAG{caramelo-filho-da-mae}"
    return check_flag(request, flagOriginal)

@app.post("/flag4")
def poco_flag():
    flagOriginal = "FLAG{voce-me-paga-carameloooo}"
    return check_flag(request, flagOriginal)

@app.post("/flag5")
def tambau_flag():
    flagOriginal = "FLAG{hehehe-estou-ficando-mais-forte}"
    return check_flag(request, flagOriginal)

@app.post("/flag6")
def cabo_branco_flag():
    flagOriginal = "FLAG{ta-de-sacanagem-caramelo-slk-kkkk}"
    return check_flag(request, flagOriginal)

@app.post("/flag7")
def seixas_flag():
    flagOriginal = "FLAG{eh-o-meu-fim-ninguem-derrota-o-caramelo}"
    return check_flag(request, flagOriginal)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)