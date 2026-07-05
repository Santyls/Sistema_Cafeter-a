import os

from flask import Flask, jsonify

from .config import Config
from .extensions import cors, db, jwt


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    from .routes.auth_routes import auth_bp
    from .routes.usuarios_routes import usuarios_bp
    from .routes.mesas_routes import mesas_bp
    from .routes.productos_routes import productos_bp
    from .routes.pedidos_routes import pedidos_bp
    from .routes.cocina_routes import cocina_bp
    from .routes.caja_routes import caja_bp
    from .routes.notificaciones_routes import notificaciones_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(usuarios_bp, url_prefix="/api/usuarios")
    app.register_blueprint(mesas_bp, url_prefix="/api/mesas")
    app.register_blueprint(productos_bp, url_prefix="/api")
    app.register_blueprint(pedidos_bp, url_prefix="/api/pedidos")
    app.register_blueprint(cocina_bp, url_prefix="/api")
    app.register_blueprint(caja_bp, url_prefix="/api")
    app.register_blueprint(notificaciones_bp, url_prefix="/api/notificaciones")

    with app.app_context():
        from . import models  # noqa: F401  (registra los modelos en SQLAlchemy)

        db.create_all()

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/docs")
    def swagger_ui():
        return """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>CoffeeFlow API Docs</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
            <script>
                SwaggerUIBundle({
                    url: '/static/openapi.json',
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis
                    ],
                    layout: "BaseLayout"
                });
            </script>
        </body>
        </html>
        """, 200

    return app
