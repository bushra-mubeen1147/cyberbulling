from flask import jsonify

def format_response(data, message=None, status_code=200):
    response = {
        "success": True,
        "data": data
    }
    if message:
        response["message"] = message
    return jsonify(response), status_code

def format_error(message, status_code=400):
    return jsonify({
        "success": False,
        "error": message
    }), status_code
