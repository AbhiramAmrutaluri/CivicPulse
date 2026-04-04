import os
import sys
import joblib  # type: ignore

# Pylance refresh trigger
class ComplaintClassifier:
    def __init__(self, model_path="models/civicpulse_classifier.pkl"):
        """Loads the pre-trained NLP pipeline into memory."""
        # Adjust path for relative execution depending on where it's launched
        if not os.path.exists(model_path):
            backup_path = os.path.join(os.path.dirname(__file__), model_path)
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Model not found at {model_path}. Run train_classifier.py first!")
            model_path = backup_path
            
        self.pipeline = joblib.load(model_path)
        self.categories = self.pipeline.classes_

    def predict_category(self, text: str) -> dict:
        """
        Takes English/Translated text and returns the optimal category + confidence score.
        """
        if not text or not text.strip():
            return {"category": "others", "confidence": 0.0}
            
        # Predict strict class
        predicted_category = self.pipeline.predict([text])[0]
        
        # Extract underlying probability matrix
        probabilities = self.pipeline.predict_proba([text])[0]
        confidence = max(probabilities)
        
        # Simple thresholding logic: Handled completely unseen junk
        # If the model is extremely unsure, route to the 'others' bucket
        if confidence < 0.35:
            predicted_category = "others"
            
        return {
            "text": text,
            "category": predicted_category,
            "confidence": float(f"{confidence:.3f}")
        }

if __name__ == "__main__":
    # Interactive Testing CLI
    print("=== CivicPulse NLP Classifier - Interactive Inference Mode ===")
    try:
        classifier = ComplaintClassifier()
        print(f"[*] Model loaded successfully. Ready categories: {classifier.categories}")
    except FileNotFoundError as e:
        print(e)
        exit(1)
    
    print("\n[Type 'exit' or 'quit' to stop]")
    while True:
        try:
            user_input = input("\nEnter citizen complaint text (English): ")
            if user_input.lower() in ['exit', 'quit']:
                break
                
            result = classifier.predict_category(user_input)
            print(f"-> Predicted Category: {result['category'].upper()} (Confidence: {result['confidence'] * 100:.1f}%)")
            
        except KeyboardInterrupt:
            print("\nShutting down.")
            break
