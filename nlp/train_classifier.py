import pandas as pd
import joblib
import os
import argparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def train_classifier(data_path, model_output_path="models/civicpulse_classifier.pkl"):
    print(f"[*] Loading training data from: {data_path}")
    
    # Expects a CSV containing 'translated_text' and 'category'
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"[!] Error: Training data not found at {data_path}. Run Phase 3 generator first!")
        return
        
    if 'translated_text' not in df.columns or 'category' not in df.columns:
        raise ValueError("Dataset must contain 'translated_text' and 'category' columns.")
        
    df = df.dropna(subset=['translated_text', 'category'])
    
    X = df['translated_text']
    y = df['category']
    
    print(f"[*] Loaded {len(df)} records. Training categories identified: {list(y.unique())}")
    
    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # ===============================================================
    # THE PIPELINE (TF-IDF + Logistic Regression)
    # Extremely fast, zero-dependency on CUDA/GPUs, ~50 KB model size
    # Easily scalable in PySpark broadcast variables later.
    # ===============================================================
    model = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=5000)),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))
    ])
    
    print("[*] Training TF-IDF + Logistic Regression NLP pipeline...")
    model.fit(X_train, y_train)
    
    print("[*] Evaluating NLP Model on Test Set...")
    predictions = model.predict(X_test)
    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(y_test, predictions))
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(model_output_path)), exist_ok=True)
    
    print(f"[*] Saving trained model to {model_output_path}")
    joblib.dump(model, model_output_path)
    print("[*] Model Training Complete! Ready for API deployment.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CivicPulse AI: NLP Category Classifier Trainer")
    parser.add_argument("--data", default="../data-simulator/civicpulse_sample.csv")
    parser.add_argument("--model-out", default="models/civicpulse_classifier.pkl")
    
    args = parser.parse_args()
    train_classifier(args.data, args.model_out)
