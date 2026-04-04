import re

class UrgencyPredictor:
    """
    A robust, hybrid rules-based + contextual heuristics urgency classifier.
    Designed for 100% determinism on critical safety issues (hackathon safe).
    """
    def __init__(self):
        # 1. Emergency Keywords (Immediate 'Critical' triggers)
        self.critical_keywords = {
            'live wire', 'electrocution', 'accident', 'open manhole',
            'fire', 'sparking', 'child fell', 'trapped', 'gas leak'
        }
        
        # 2. High Priority Keywords
        self.high_keywords = {
            'dead animal', 'no drinking water', 'overflowing',
            'contamination', 'disease', 'bites', 'days', 'months'
        }

        # 3. Category-Based Priority Boosting
        # The underlying category dictates the baseline minimum urgency
        self.category_baselines = {
            'electricity': 'medium', 
            'water_supply': 'high',  # No water is fundamentally high urgency
            'public_health': 'high',
            'drainage': 'medium',
            'sanitation': 'low',
            'roads': 'low',
            'street_lights': 'low',
            'others': 'low'
        }

    def predict_urgency(self, text: str, category: str = "others") -> dict:
        """
        Determines urgency dynamically.
        Returns a dict: {"urgency": str, "confidence": float, "reason": str}
        """
        if not text:
            return {"urgency": "low", "confidence": 1.0, "reason": "Empty complaint text"}
            
        text_lower = text.lower()
        category = category.lower()
        
        # Phase 1: Deterministic Critical Safety Net (Overrides everything)
        for kw in self.critical_keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                return {
                    "urgency": "critical",
                    "confidence": 1.0,
                    "reason": f"Matched critical safety keyword: '{kw}'"
                }

        # Phase 2: High Priority Inconvenience Check
        for kw in self.high_keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                return {
                    "urgency": "high",
                    "confidence": 0.9,
                    "reason": f"Matched high-priority keyword: '{kw}'"
                }

        # Phase 3: Contextual Escalation (Category Baseline + Heuristics)
        baseline = self.category_baselines.get(category, 'low')
        
        # Escalation heuristic: Exclamation marks or ALL CAPS often imply extreme frustration
        # A low baseline (like a pothole) gets escalated to medium.
        if "!" in text or text.isupper():
            if baseline == 'low':
                return {"urgency": "medium", "confidence": 0.8, "reason": "Punctuation/Caps escalation"}
            elif baseline == 'medium':
                return {"urgency": "high", "confidence": 0.8, "reason": "Punctuation/Caps escalation"}
                
        # Phase 4: Fallback
        return {
            "urgency": baseline,
            "confidence": 0.7,
            "reason": f"Category '{category}' exact baseline match"
        }

if __name__ == "__main__":
    # Interactive CLI Testing
    print("=== CivicPulse Urgency Predictor ===")
    predictor = UrgencyPredictor()
    
    test_cases = [
        ("Live wire fallen on the street!", "electricity"),
        ("Garbage not collected", "sanitation"),
        ("No drinking water for 3 days", "water_supply"),
        ("Huge pothole", "roads"),
        ("HUGE POTHOLE FIX IT NOW", "roads")
    ]
    
    for text, cat in test_cases:
        result = predictor.predict_urgency(text, cat)
        print(f"\nText: {text}\nCategory: {cat}")
        print(f"-> URGENCY: {result['urgency'].upper()} | Reason: {result['reason']}")
