import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import json
import os
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
    1. url_length
    2. num_dots
    3. num_hyphens
    4. num_special_chars (@, %, ?, =, &)
    5. has_ip (binary)
    6. num_subdomains
    7. is_https (binary)
    8. num_digits
    9. num_params
    10. path_length
    11. url_entropy
    12. digit_ratio
    13. special_char_ratio
    14. has_sensitive_words (paypal, login, secure, verify, bank, account, update)
    15. risky_tld (binary: .tk, .ga, .cf, .ml, .gq)
    16. num_encoded_chars (%xx)
    17. fragment_length (#...)
    18. has_port (binary)
    19. top_level_domain_length
    20. hostname_length
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

def create_and_evaluate():
    # 1. Generate more realistic synthetic data based on feature extraction logic
    # In a real scenario, we'd use a labelled dataset of URLs.
    n_samples = 2000
    features_list = []
    labels = []
    
    # Simulate some URLs
    common_phishing_patterns = ["login-update", "secure-account", "paypal-security", "verify-identity"]
    legit_domains = ["google.com", "github.com", "microsoft.com", "amazon.com", "linkedin.com"]
    
    for _ in range(n_samples // 2):
        # Legit
        domain = np.random.choice(legit_domains)
        url = f"https://{domain}/path/to/page?id={np.random.randint(1000)}"
        features_list.append(extract_features(url))
        labels.append(0)
        
        # Phishing
        pattern = np.random.choice(common_phishing_patterns)
        url = f"http://{pattern}.verify.com-secure.tk/login?user=root"
        features_list.append(extract_features(url))
        labels.append(1)
        
    X = np.array(features_list)
    y = np.array(labels)
    
    # 2. Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Train model
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # 4. Save model
    model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
    joblib.dump(clf, model_path)
    
    # 5. Evaluate
    y_pred = clf.predict(X_test)
    
    metrics = {
        "Accuracy": accuracy_score(y_test, y_pred),
        "Feature Count": len(extract_features("test.com"))
    }
    
    return metrics

if __name__ == "__main__":
    results = create_and_evaluate()
    print("Optimization Complete. Model trained with URL feature extraction logic.")
    print(json.dumps(results, indent=4))
