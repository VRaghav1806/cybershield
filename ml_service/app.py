from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

import re
import math

def get_entropy(text):
    if not text:
        return 0
    probabilities = [text.count(c) / len(text) for c in set(text)]
    return -sum(p * math.log2(p) for p in probabilities if p > 0)

def extract_features(url):
    """
    Extracted Features (Total: 20)
    """
    url_length = len(url)
    num_dots = url.count('.')
    num_hyphens = url.count('-')
    num_special_chars = len(re.findall(r'[?=&@%]', url))
    has_ip = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) else 0
    
    # Domain extraction
    try:
        domain_parts = url.split('//')[-1].split('/')[0].split('.')
        num_subdomains = len(domain_parts) - 2 if len(domain_parts) > 2 else 0
        hostname = url.split('//')[-1].split('/')[0]
        hostname_length = len(hostname)
        tld = domain_parts[-1]
        tld_length = len(tld)
    except:
        num_subdomains = 0
        hostname_length = 0
        tld = ""
        tld_length = 0

    is_https = 1 if url.startswith('https') else 0
    num_digits = len(re.findall(r'\d', url))
    num_params = url.count('&') + url.count('?')
    
    path = url.split('//')[-1].split('/', 1)[-1] if '/' in url.split('//')[-1] else ""
    path_length = len(path)
    
    # Advanced Features
    url_entropy = get_entropy(url)
    digit_ratio = num_digits / url_length if url_length > 0 else 0
    special_char_ratio = num_special_chars / url_length if url_length > 0 else 0
    
    sensitive_words = ['paypal', 'login', 'secure', 'verify', 'bank', 'account', 'update', 'signin', 'password']
    has_sensitive_words = 1 if any(word in url.lower() for word in sensitive_words) else 0
    
    risky_tlds = ['tk', 'ga', 'cf', 'ml', 'gq', 'top', 'xyz', 'icu']
    risky_tld = 1 if tld.lower() in risky_tlds else 0
    
    num_encoded = len(re.findall(r'%[0-9a-fA-F]{2}', url))
    fragment_length = len(url.split('#')[-1]) if '#' in url else 0
    has_port = 1 if re.search(r':[0-9]+', hostname) else 0

    return [
        url_length, num_dots, num_hyphens, num_special_chars, has_ip, 
        num_subdomains, is_https, num_digits, num_params, path_length,
        url_entropy, digit_ratio, special_char_ratio, has_sensitive_words, 
        risky_tld, num_encoded, fragment_length, has_port, tld_length, hostname_length
    ]

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        url = data.get('url')
        features = data.get('features')
        
        # Priority 1: URL extraction
        if url:
            features_to_use = extract_features(url)
        # Priority 2: Raw features list (backward compatibility)
        elif features and isinstance(features, list):
            features_to_use = features
        else:
            return jsonify({"error": "No URL or valid features provided"}), 400
            
        features_array = np.array(features_to_use).reshape(1, -1)
        
        # Check feature count
        if features_array.shape[1] != model.n_features_in_:
            return jsonify({
                "error": f"Model expects {model.n_features_in_} features, but got {features_array.shape[1]}"
            }), 400
            
        pred = model.predict(features_array)
        prob = model.predict_proba(features_array).tolist() if hasattr(model, "predict_proba") else None
        
        return jsonify({
            "prediction": int(pred[0]),
            "probability": prob,
            "status": "success",
            "extracted_features": features_to_use if url else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
