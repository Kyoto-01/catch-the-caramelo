from flask import Flask


app = Flask(__name__)


@app.route("/static/areiavermelha.txt")
def areia_vermelha_flag():
    return """


             /\_/\  
           =( °w° )=   < AUAU..err..MIAU você não vai me parar!!
             )   (  //
            (__ __)//


FLAG{caramelo-filho-da-mae}

"""


if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)
