import os

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/recuperar")
def recuperar():
    return render_template("recuperar.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", active="dashboard")


@app.route("/gastos")
def gastos():
    return render_template("gastos.html", active="gastos")


@app.route("/ganancias")
def ganancias():
    return render_template("ganancias.html", active="ganancias")


@app.route("/productos")
def productos():
    return render_template("productos.html", active="productos")


@app.route("/pedidos")
def pedidos():
    return render_template("pedidos.html", active="pedidos")


@app.route("/inventario")
def inventario():
    return render_template("inventario.html", active="inventario")


@app.route("/usuarios")
def usuarios():
    return render_template("usuarios.html", active="usuarios")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
