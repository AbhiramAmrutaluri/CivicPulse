from datetime import datetime, timedelta

class ComplaintRouter:
    """
    Handles department assignment and dynamic Service Level Agreement (SLA) tracking for complaints.
    """
    def __init__(self):
        # 1. Category-to-Department Definition Mapping
        self.department_map = {
            'sanitation': 'Solid Waste Management',
            'drainage': 'Sewerage Department',
            'roads': 'Public Works Department (PWD)',
            'water_supply': 'Water Board',
            'street_lights': 'Electrical Department',
            'public_health': 'Health Department',
            'electricity': 'Power Distribution Company',
            'others': 'General Municipal Admin'
        }
        
        # 2. Urgency-to-SLA Standard Definition (in Hours)
        self.sla_map = {
            'critical': 12,   # 12 hours max response
            'high': 24,       # 1 day
            'medium': 72,     # 3 days
            'low': 168        # 7 days
        }

    def process_ticket(self, category: str, urgency: str, created_at_str: str) -> dict:
        """
        Ingests the NLP category and heuristic urgency to output final database routing metrics.
        Returns: strict department name, assigned SLA hours, strict deadline timestamp, 
                 dynamic overdue status, and reassignment triggers.
        """
        category = category.lower()
        urgency = urgency.lower()

        # Step A: Department Assignment
        assigned_department = self.department_map.get(category, 'General Municipal Admin')
        
        # Step B: Determine SLA Standard Deadline
        sla_hours = self.sla_map.get(urgency, 168)  # Default lowest priority
        
        try:
            # We enforce standard YYYY-MM-DD HH:MM:SS format across the CivicPulse pipeline
            created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            created_at = datetime.now()
            
        deadline = created_at + timedelta(hours=sla_hours)
        
        # Step C: Assess Live Overdue Status Flag
        # If the current physical time is past the SLA deadline limit, it's flagged natively
        is_overdue = datetime.now() > deadline

        # Step D: Support Future Logic - Reassignment
        # If a CRITICAL or HIGH issue breaches its SLA, instantly flag it up the organizational chain
        reassignment_flag = is_overdue and urgency in ['critical', 'high']

        return {
            "department": assigned_department,
            "sla_limit_hours": sla_hours,
            "deadline_timestamp": deadline.strftime("%Y-%m-%d %H:%M:%S"),
            "is_overdue": is_overdue,
            "reassignment_eligible": reassignment_flag
        }

if __name__ == "__main__":
    import json
    print("=== CivicPulse SLA Routing Engine ===")
    router = ComplaintRouter()
    
    # Flow Test 1: Recent, minor issue (Low risk)
    res1 = router.process_ticket(
        category="roads", 
        urgency="medium", 
        created_at_str=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    print("\nTicket A (Pothole - Reported Now):")
    print(json.dumps(res1, indent=2))
    
    # Flow Test 2: Historical, severe issue (Should be flagged overdue/reassigned)
    past_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
    res2 = router.process_ticket(
        category="water_supply", 
        urgency="high", 
        created_at_str=past_date
    )
    print("\nTicket B (No Water - Reported 3 Days Ago):")
    print(json.dumps(res2, indent=2))
