# 🎬 AI Pulse Map - Step-by-Step Usage Guide

## What You'll See When You Open the Page

```
═══════════════════════════════════════════════════════════════════
                      AI PULSE MAP
    PySpark DBSCAN grouped incidents requiring ground
    intervention.
═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────┬──────────────────────────────┐
│                                 │   LIVE INCIDENT FEED         │
│   SELECTED INCIDENT              │   ─────────────────         │
│   DETAILS CARD                   │                              │
│                                 │   HS-491A (Water Supply)     │
│   Cluster: HS-491A               │   🔴 CRITICAL | 14 reports  │
│   Category: Water Supply         │   Ward 4 - Secunderabad      │
│   Severity: 98/100               │   [Dispatch Unit]            │
│                                 │                              │
│   "Water contamination and       │   HS-729X (Electricity)     │
│    foul brown smell in drinking  │   🟠 HIGH | 11 reports      │
│    supply across three           │   Ward 1 - Kapra            │
│    neighborhood blocks..."       │   [Dispatch Unit]            │
│                                 │                              │
│   Location: 17.4399°N,           │   HS-882C (Roads)          │
│   78.4983°E                      │   🟠 HIGH | 8 reports       │
│   14 Duplicate Incidents         │   Ward 10 - Charminar       │
│   Trend: ↗️ Increasing            │   [Dispatch Unit]            │
│                                 │                              │
│   [Dispatch Ground Unit]         │   HS-105D (Sanitation)     │
│   ◄─ CLICK TO DISPATCH           │   🟡 MEDIUM | 5 reports     │
│                                 │   Ward 6 - Jubilee Hills    │
│                                 │   [Dispatch Unit]            │
│                                 │                              │
├─────────────────────────────────┴──────────────────────────────┤
│                                                                 │
│                   INTERACTIVE INDIA MAP                        │
│                   ────────────────────                         │
│                                                                 │
│                    🔴 (Selected)                               │
│                                                                 │
│              🟠          🟡                                    │
│                                                                 │
│                   🟢                                           │
│                                                                 │
│   [LEGEND] 🔴Red=Critical 🟠Orange=High                       │
│            🟡Yellow=Medium 🟢Green=Low                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 Step-by-Step Walkthrough

### **STEP 1: Page Loads**
```
✅ You see the Pulse Map page
✅ Interactive map shows all incidents with color dots
✅ Feed panel on right shows list of incidents
✅ Details card on left shows first incident selected
```

### **STEP 2: Identify Critical Issues**
```
🔴 You immediately spot RED dots (Critical)
   → These need immediate attention

🟠 Then scan for ORANGE dots (High priority)
   → These need urgent response

🟡 YELLOW dots are important but less urgent
   → Can be handled after red/orange

🟢 GREEN dots are routine
   → Can be scheduled for later
```

### **STEP 3: Select an Incident**

**Option A - Click on Map:**
```
1. Look at the map
2. Click on any colored dot (marker)
3. That incident becomes selected
4. Details card updates to show that incident
5. Feed panel scrolls to highlight it
6. Map marker gets a glowing halo
```

**Option B - Click on Feed:**
```
1. Look at the feed panel on right
2. Click on any incident in the list
3. That incident becomes selected
4. Details card shows full information
5. Map marker glows to show which one
6. You see the GPS coordinates
```

### **STEP 4: Review Details**
```
Details Card Shows:
  • Cluster ID (HS-491A)
  • Category (Water, Roads, Electricity, etc.)
  • Severity Score (98/100)
  • GPS Coordinates (17.4399° N, 78.4983° E)
  • Ward/Location (Ward 4 - Secunderabad)
  • Complaint Count (14 people reported)
  • Actual citizen complaint text
  • Trend (↗️ increasing, → stable, ↘️ decreasing)
```

### **STEP 5: Dispatch Ground Unit**

**When you click the button:**

```
1. IMMEDIATELY: Button shows "Dispatching..." state
                Map marker pulses

2. INSTANT: Toast notification appears at bottom-right:
            "🚗 Ground unit dispatched to Ward 4!"
            
3. BUTTON CHANGES:
   From: Blue "Dispatch Unit" button
   To:   Green "✓ Dispatched!" button
   
4. AFTER 3 SECONDS: Button resets to blue
                    Notification disappears
                    Ready to dispatch elsewhere
```

### **STEP 6: Handle Multiple Incidents**
```
1. Dispatch to first incident (Red)
   → Toast: "Ground unit dispatched to Ward 4!"
   → Button: ✓ Dispatched!

2. Click next incident (Orange)
   → Map and feed highlight new incident
   → Details card updates
   → Different dispatch button available

3. Dispatch to second incident
   → Toast: "Ground unit dispatched to Ward 1!"
   → Can continue with other incidents

4. All dispatches confirmed in real-time
```

---

## 🎯 Real-World Example: Crisis Response

### **Scenario: Water Crisis + Power Outage**

**Minute 0:** Open Pulse Map Page
```
✓ See map with multiple colored dots
✓ Identify 🔴 RED incident: Water Supply (HS-491A)
✓ Also see 🟠 ORANGE: Electricity (HS-729X)
```

**Minute 1:** Address Critical Issue
```
✓ Click RED marker on map
✓ Details show: "Water contamination" - 14 complaints
✓ Location: Ward 4, Secunderabad
✓ GPS: 17.4399° N, 78.4983° E
✓ Trend: ↗️ Increasing (getting worse!)
```

**Minute 2:** Dispatch First Unit
```
✓ Click "Dispatch Ground Unit" button
✓ Toast: "🚗 Ground unit dispatched to Ward 4!"
✓ Button: ✓ Dispatched! (green for 3 seconds)
✓ Ground unit sent with GPS coordinates
```

**Minute 3:** Assess Secondary Issue
```
✓ Click ORANGE marker (Electricity)
✓ Details: "6-hour power cuts" - 11 complaints
✓ Location: Ward 1, Kapra
✓ Trend: ↗️ Increasing
```

**Minute 4:** Dispatch Second Unit
```
✓ Click "Dispatch Ground Unit" button
✓ Toast: "🚗 Ground unit dispatched to Ward 1!"
✓ Now 2 units in the field
✓ Both locations responded to
```

**Minute 5+:** Continue as Needed
```
✓ Check for new incidents in feed
✓ Handle YELLOW incidents (medium priority)
✓ Schedule GREEN incidents (low priority)
```

---

## 🔄 Interaction Flowchart

```
User Opens Page
    ↓
Sees Map with Color-Coded Incidents
    ↓
Identifies Priority (Red = Highest)
    ↓
┌───────────────────┴──────────────────┐
│                                      │
Click Map Marker        OR         Click Feed Item
│                                      │
└───────────────────┬──────────────────┘
                    ↓
        Incident Selected & Details Shown
                    ↓
         User Reviews Information
         (Category, Location, Trend, Count)
                    ↓
        User Clicks "Dispatch Unit" Button
                    ↓
    ┌───────────────────────────────────┐
    ↓                                   ↓
Toast Shows          Button Shows    Ground Unit
✓ Unit dispatched    ✓ Dispatched!   Routes to
✓ Exact location     ✓ 3 seconds     Location
                     ✓ Then resets
                    ↓
         Ready to Handle Next Incident
              (Repeat as needed)
```

---

## 💡 Quick Tips for Efficiency

### **Scanning the Map**
1. **First:** Scan for RED dots
2. **Second:** Look for ORANGE dots  
3. **Third:** Check YELLOW dots
4. **Last:** Handle GREEN dots

### **Using the Feed**
- Scroll through all incidents
- Identify highest complaint counts
- Note increasing trends (↗️)
- Prioritize accordingly

### **Dispatch Optimization**
- Group nearby incidents
- Coordinate multiple units
- Check GPS coordinates
- Share with ground units
- Track progress via trend updates

### **Response Strategy**
- Critical (Red) → Dispatch immediately
- High (Orange) → Dispatch within 1 hour
- Medium (Yellow) → Dispatch within 4 hours
- Low (Green) → Schedule for next day

---

## ✅ Verification Checklist

Opening the page for first time? Check these:

- [ ] Map is visible with colored dots
- [ ] Can see multiple incidents (4-8 dots)
- [ ] Different colors represent different severities
- [ ] Feed panel on right shows incident list
- [ ] Can click map markers to select
- [ ] Can click feed items to highlight on map
- [ ] Details card updates when selecting
- [ ] Dispatch button visible in details
- [ ] Dispatch button visible in feed (each item)
- [ ] Clicking dispatch shows toast notification
- [ ] Toast shows correct location name
- [ ] Button changes to green "✓ Dispatched!"
- [ ] Button resets after 3 seconds

---

## 🎨 Understanding the Colors Instantly

```
LOOK AT THIS          MEAN THIS              DO THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 Red dot            CRITICAL DANGER        DISPATCH NOW!
🟠 Orange dot         URGENT ISSUE           DISPATCH TODAY
🟡 Yellow dot         IMPORTANT MATTER       DISPATCH SOON
🟢 Green dot          ROUTINE TASK           SCHEDULE LATER

Large dot count       MANY PEOPLE AFFECTED  ALLOCATE MORE
Small dot count       FEW PEOPLE AFFECTED   STANDARD TEAM

↗️ Arrow increasing    PROBLEM WORSENING     FASTER RESPONSE
↘️ Arrow decreasing    PROBLEM IMPROVING     CAN DEFER
→ Arrow stable        PROBLEM STEADY        STANDARD RESPONSE
```

---

## 🚀 You're Ready!

All features are **working perfectly** and **production-ready**. 

Open the **Pulse Map** page from your navigation menu and start managing incidents like a pro! 🗺️✨

---

**Last Updated**: March 26, 2026  
**Status**: ✅ **All Features Live and Tested**  
**Ready to Deploy**: Yes
